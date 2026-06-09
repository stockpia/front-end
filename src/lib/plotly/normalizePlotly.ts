import type { StockChartRange, StockChartType } from "@/types/stocks";

export type PlotlyFigure = {
  data?: unknown[];
  layout?: Record<string, unknown>;
};

type NormalizeOptions = {
  chartType?: StockChartType;
  range?: StockChartRange;
};

// ─────────────────────────────────────────────
// 진입점
// ─────────────────────────────────────────────

export default function normalizePlotly(
  figure: PlotlyFigure,
  { chartType, range }: NormalizeOptions = {},
): PlotlyFigure {
  switch (chartType) {
    case "candlestick":
      return normalizeCandlestick(figure, range);
    case "technical":
      return normalizeTechnical(figure, range);
    case "volume":
      return normalizeVolume(figure);
    case "line":
      return normalizeLine(figure, range);
    default:
      return figure;
  }
}

// ─────────────────────────────────────────────
// 차트 타입별 정규화
// ─────────────────────────────────────────────

function normalizeCandlestick(
  figure: PlotlyFigure,
  range?: StockChartRange,
): PlotlyFigure {
  return normalizeCandlestickLike(figure, { withExtremes: true, range });
}

function normalizeTechnical(
  figure: PlotlyFigure,
  range?: StockChartRange,
): PlotlyFigure {
  const normalized = normalizeCandlestickLike(figure, {
    withExtremes: false,
    range,
  });
  const data = normalized.data ?? [];

  // RSI trace를 한 번만 탐색
  const rsiTrace = findRsiTrace(data);
  if (!rsiTrace) {
    return normalized;
  }

  const rsiShapes = buildRsiGuideShapesFromTrace(rsiTrace);
  const rsiAnnotations = buildRsiGuideAnnotationsFromTrace(rsiTrace);

  const layout = { ...(normalized.layout ?? {}) };
  layout.shapes = mergeByMarker(
    toArray(layout.shapes),
    rsiShapes,
    "__rsiGuide",
  );
  layout.annotations = mergeByMarker(
    toArray(layout.annotations),
    rsiAnnotations,
    "__rsiGuide",
  );

  return { ...normalized, layout };
}

function normalizeVolume(figure: PlotlyFigure): PlotlyFigure {
  if (!figure.data || !Array.isArray(figure.data)) {
    return figure;
  }

  const volumeTrace = figure.data.find((trace) => {
    if (!trace || typeof trace !== "object") return false;
    const typed = trace as Record<string, unknown>;
    return typed.type === "bar" || typed.name === "거래량";
  }) as Record<string, unknown> | undefined;

  if (!volumeTrace) {
    return figure;
  }

  const xs = toArray(volumeTrace.x);
  const ys = toNumberArray(volumeTrace.y);

  if (xs.length < 80) {
    return figure;
  }

  const weeklyData = convertToWeeklyVolume(xs, ys, volumeTrace);
  return {
    ...figure,
    data: figure.data.map((trace) =>
      trace === volumeTrace ? weeklyData : trace,
    ),
  };
}

function normalizeLine(
  figure: PlotlyFigure,
  range?: StockChartRange,
): PlotlyFigure {
  let intradayTicks: IntradayTicks | null = null;
  let dataAfterIntraday: unknown[] = figure.data ?? [];
  if (range === "1d") {
    const result = normalizeIntradayX(figure.data ?? []);
    dataAfterIntraday = result.data;
    intradayTicks = result.ticks;
  }
  const nextLayout = normalizeCandlestickLayout(figure.layout, {
    collapseWeekends: false,
    range,
    intradayTicks,
  });
  const nextData = normalizeLineData(dataAfterIntraday);
  const extremeAnnotations = buildCandlestickExtremes(nextData);

  if (extremeAnnotations) {
    nextLayout.annotations = mergeByMarker(
      toArray(nextLayout.annotations),
      extremeAnnotations,
      // extremes는 marker key 없이 단순 추가
    );
  }

  return { ...figure, data: nextData, layout: nextLayout };
}

// ─────────────────────────────────────────────
// candlestick / technical 공통 처리
// ─────────────────────────────────────────────

function normalizeCandlestickLike(
  figure: PlotlyFigure,
  {
    withExtremes,
    range,
  }: { withExtremes: boolean; range?: StockChartRange },
): PlotlyFigure {
  let intradayTicks: IntradayTicks | null = null;
  let dataAfterIntraday: unknown[] = figure.data ?? [];
  if (range === "1d") {
    const result = normalizeIntradayX(figure.data ?? []);
    dataAfterIntraday = result.data;
    intradayTicks = result.ticks;
  }
  const nextLayout = normalizeCandlestickLayout(figure.layout, {
    // 1d (당일 분봉) 에는 토/일이 없으니 weekend rangebreak 의미 없음
    collapseWeekends: range !== "1d",
    range,
    intradayTicks,
  });
  const nextData = normalizeCandlestickData(dataAfterIntraday);

  if (withExtremes) {
    const extremeAnnotations = buildCandlestickExtremes(nextData);
    if (extremeAnnotations) {
      nextLayout.annotations = [
        ...toArray(nextLayout.annotations),
        ...extremeAnnotations,
      ];
    }
  }

  return { ...figure, data: nextData, layout: nextLayout };
}

// ─────────────────────────────────────────────
// 레이아웃 정규화
// ─────────────────────────────────────────────

function normalizeCandlestickLayout(
  layout: PlotlyFigure["layout"],
  {
    collapseWeekends = false,
    range,
    intradayTicks = null,
  }: {
    collapseWeekends?: boolean;
    range?: StockChartRange;
    intradayTicks?: IntradayTicks | null;
  } = {},
): Record<string, unknown> {
  const nextLayout: Record<string, unknown> = { ...(layout ?? {}) };
  nextLayout.showlegend = false;

  const xAxisKeys = Object.keys(nextLayout).filter((k) => /^xaxis\d*$/.test(k));
  const yAxisKeys = Object.keys(nextLayout).filter((k) => /^yaxis\d*$/.test(k));

  // 축 키가 없으면 기본 키 사용
  const resolvedXKeys = xAxisKeys.length ? xAxisKeys : ["xaxis"];
  const resolvedYKeys = yAxisKeys.length ? yAxisKeys : ["yaxis"];

  resolvedXKeys.forEach((key) => {
    nextLayout[key] = normalizeXAxis(
      nextLayout[key] as Record<string, unknown>,
      { collapseWeekends, range, intradayTicks },
    );
  });

  resolvedYKeys.forEach((key) => {
    nextLayout[key] = normalizeYAxis(
      nextLayout[key] as Record<string, unknown>,
      { axisKey: key },
    );
  });

  const axisTitleAnnotations = buildYAxisTitleAnnotations(
    nextLayout,
    resolvedYKeys,
  );
  if (axisTitleAnnotations.length) {
    nextLayout.annotations = mergeByMarker(
      toArray(nextLayout.annotations),
      axisTitleAnnotations,
      "__axisTitle",
    );
  }

  const margin = (nextLayout.margin as Record<string, unknown>) ?? {};
  nextLayout.margin = {
    ...margin,
    l: Math.max(typeof margin.l === "number" ? margin.l : 0, 56),
    r: Math.max(typeof margin.r === "number" ? margin.r : 0, 56),
  };

  nextLayout.hoverlabel = {
    bgcolor: "rgba(255,255,255,0.98)",
    bordercolor: "#cbd5e1",
    font: {
      family:
        "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      size: 13,
      color: "#0f172a",
    },
    align: "left",
    namelength: -1,
  };

  return nextLayout;
}

function normalizeXAxis(
  axis?: Record<string, unknown>,
  {
    collapseWeekends = false,
    range,
    intradayTicks = null,
  }: {
    collapseWeekends?: boolean;
    range?: StockChartRange;
    intradayTicks?: IntradayTicks | null;
  } = {},
) {
  const { title: _, ...cleaned } = axis ?? {};

  const existingRangebreaks = toArray(cleaned.rangebreaks);
  const nextRangebreaks = collapseWeekends
    ? mergeWeekendRangebreaks(existingRangebreaks)
    : existingRangebreaks;

  // 1d 분봉 차트: x = 09:00 부터 분 단위 인덱스, range = [0, 390] (정규장).
  // 데이터가 적어도 그 안에 작은 위치로 표시 → 캔들 폭이 일정하게 얇음.
  if (intradayTicks) {
    return {
      ...cleaned,
      showticklabels: true,
      ticks: "",
      tickfont: { size: 10, color: "#94a3b8" },
      tickmode: "array",
      tickvals: intradayTicks.tickvals,
      ticktext: intradayTicks.ticktext,
      range: intradayTicks.range,
      automargin: true,
      rangebreaks: nextRangebreaks,
    };
  }

  return {
    ...cleaned,
    showticklabels: true,
    ticks: "",
    tickfont: {
      size: 10,
      color: "#94a3b8",
    },
    tickformat: resolveTickformat(range, cleaned.tickformat),
    automargin: true,
    rangebreaks: nextRangebreaks,
  };
}

// range 별 x축 라벨 포맷.
// - 1d (분봉): 시:분 — "14:30"
// - 1m / 3m: 월/일 — "6/2"
// - 1y / default: 월 + 연 — "6월\n2026"
function resolveTickformat(
  range: StockChartRange | undefined,
  fallback: unknown,
) {
  if (typeof fallback === "string" && fallback.length > 0) {
    return fallback;
  }
  switch (range) {
    case "1d":
      return "%H:%M";
    case "1m":
    case "3m":
      return "%-m/%-d";
    case "1y":
    default:
      return "%-m월\n%Y";
  }
}

function mergeWeekendRangebreaks(rangebreaks: unknown[]) {
  const hasWeekendBreak = rangebreaks.some((item) => {
    if (!item || typeof item !== "object") return false;
    const bounds = (item as Record<string, unknown>).bounds;
    return Array.isArray(bounds) && bounds[0] === "sat" && bounds[1] === "mon";
  });

  return hasWeekendBreak
    ? rangebreaks
    : [...rangebreaks, { bounds: ["sat", "mon"] }];
}

function normalizeYAxis(
  axis?: Record<string, unknown>,
  { axisKey = "yaxis" }: { axisKey?: string } = {},
) {
  const { title: _, ...cleaned } = axis ?? {};

  return {
    ...cleaned,
    showticklabels: axisKey === "yaxis",
    ticks: "",
    tickfont: {
      size: 10,
      color: "#94a3b8",
    },
    tickformat: ",.0f",
    separatethousands: true,
    automargin: true,
  };
}

// ─────────────────────────────────────────────
// y축 타이틀 annotation
// ─────────────────────────────────────────────

function buildYAxisTitleAnnotations(
  layout: Record<string, unknown>,
  yAxisKeys: string[],
) {
  return yAxisKeys.flatMap((axisKey) => {
    if (axisKey !== "yaxis2") {
      return [];
    }

    const axis = (layout[axisKey] as Record<string, unknown> | undefined) ?? {};
    const domain = Array.isArray(axis.domain) ? axis.domain : [0, 1];
    const domainStart = typeof domain[0] === "number" ? domain[0] : 0;
    const domainEnd = typeof domain[1] === "number" ? domain[1] : 1;
    const centerY = (domainStart + domainEnd) / 2;

    return {
      __axisTitle: true,
      xref: "paper",
      yref: "paper",
      x: 0,
      y: centerY,
      xanchor: "right",
      yanchor: "middle",
      xshift: -14,
      textangle: 0,
      text: "거래량",
      showarrow: false,
      font: { size: 12, color: "#334155" },
    };
  });
}

// ─────────────────────────────────────────────
// 1d 분봉 x축 정규화
// ─────────────────────────────────────────────

// 백엔드(KIS) 가 1d 차트 x 를 "HH:MM" string 으로 보내면 plotly 가 category axis 로
// 처리해 30개 라벨이 빽빽이 표시되고 tickformat 도 무시됨.
//
// datetime 으로 변환하면 plotly 가 데이터 간격 기준으로 캔들 폭 자동 결정 —
// 5/10분봉이 1분봉보다 굵게 표시됨 (5분/10분 간격 차이).
//
// 대신 *인덱스* (0, 1, 2, ...) 로 변환 → 인접 캔들 간격이 1로 균일해서
// 1/5/10분봉 모두 동일한 얇은 폭으로 그려짐. 실제 시각은 tickvals/ticktext 로
// 매시간 정각만 라벨 표시.
//
// 또한 KIS API 가 14:00 같은 시각을 두 번 보내는 경우가 있어 마지막을 우선해 dedup.
const HH_MM = /^(\d{1,2}):(\d{2})$/;

// 정규장 09:00-15:30 = 390분. 1분 단위 인덱스로 매핑 + xaxis.range=[0,390]
// → 데이터가 적어도 그 안에 작은 위치로 표시, 캔들 폭 = 그래프 너비 / 390 으로 균일.
const MARKET_OPEN_HOUR = 9;
const MARKET_TOTAL_MINUTES = 390;

type IntradayTicks = {
  tickvals: number[];
  ticktext: string[];
  range: [number, number];
};

type IntradayResult = {
  data: unknown[];
  ticks: IntradayTicks | null;
};

function minutesFromOpen(t: string): number {
  const m = HH_MM.exec(t);
  if (!m) return 0;
  const h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  return Math.max(0, (h - MARKET_OPEN_HOUR) * 60 + min);
}

function normalizeIntradayX(data: unknown[]): IntradayResult {
  let ticks: IntradayTicks | null = null;

  const nextData = data.map((trace) => {
    if (!trace || typeof trace !== "object") return trace;
    const typed = trace as Record<string, unknown>;
    const xs = typed.x;
    if (!Array.isArray(xs)) return trace;

    const allTimeStrings = xs.every(
      (v) => typeof v === "string" && HH_MM.test(v),
    );
    if (!allTimeStrings) return trace;

    const xsStr = xs as string[];

    // dedup by HH:MM (KIS 중복 케이스), 마지막을 우선
    const seen = new Map<string, number>();
    xsStr.forEach((v, i) => seen.set(v, i));
    const keptIndices = Array.from(seen.values()).sort((a, b) => a - b);

    // 첫 trace 에서 tickvals/ticktext + range 계산.
    // 데이터 범위 + 양쪽 10% padding (min 5분) — 캔들이 화면을 적절히 채우면서
    // 정규장 위치는 유지 (1분봉=많은 캔들=얇게, 5/10분봉=적은 캔들=적당 폭).
    if (!ticks) {
      const firstMin = minutesFromOpen(xsStr[keptIndices[0]]);
      const lastMin = minutesFromOpen(
        xsStr[keptIndices[keptIndices.length - 1]],
      );
      const padding = Math.max(5, Math.round((lastMin - firstMin) * 0.1));
      const rangeStart = Math.max(0, firstMin - padding);
      const rangeEnd = Math.min(MARKET_TOTAL_MINUTES, lastMin + padding);

      // range 안의 매시간 정각만 라벨 (예: 14:00, 15:00)
      const tickvals: number[] = [];
      const ticktext: string[] = [];
      for (let h = MARKET_OPEN_HOUR; h <= 15; h++) {
        const idx = (h - MARKET_OPEN_HOUR) * 60;
        if (idx >= rangeStart && idx <= rangeEnd) {
          tickvals.push(idx);
          ticktext.push(`${h.toString().padStart(2, "0")}:00`);
        }
      }
      // 정각이 range 안에 하나도 없으면 데이터 첫/마지막 시각을 라벨로 fallback
      if (tickvals.length === 0) {
        tickvals.push(firstMin, lastMin);
        ticktext.push(
          xsStr[keptIndices[0]],
          xsStr[keptIndices[keptIndices.length - 1]],
        );
      }
      ticks = {
        tickvals,
        ticktext,
        range: [rangeStart, rangeEnd],
      };
    }

    return rebuildTraceWithMinuteX(typed, keptIndices, xsStr);
  });

  return { data: nextData, ticks };
}

function rebuildTraceWithMinuteX(
  trace: Record<string, unknown>,
  keptIndices: number[],
  xsStr: string[],
): Record<string, unknown> {
  const next: Record<string, unknown> = { ...trace };

  // x = 09:00 부터 분 단위 인덱스. 예: 09:00 → 0, 14:50 → 350.
  // 모든 분봉이 1분 단위 인덱스 → plotly 가 캔들 폭 1로 그림.
  next.x = keptIndices.map((i) => minutesFromOpen(xsStr[i]));

  for (const key of ["open", "high", "low", "close", "y", "marker"]) {
    const val = trace[key];
    if (Array.isArray(val)) {
      next[key] = keptIndices.map((i) => val[i]);
    } else if (key === "marker" && val && typeof val === "object") {
      const m = val as Record<string, unknown>;
      const color = m.color;
      if (Array.isArray(color)) {
        next.marker = { ...m, color: keptIndices.map((i) => color[i]) };
      }
    }
  }
  return next;
}

// ─────────────────────────────────────────────
// 데이터 정규화
// ─────────────────────────────────────────────

function normalizeCandlestickData(data: unknown[]): unknown[] {
  return data.map((trace) => {
    if (!trace || typeof trace !== "object") return trace;

    const typedTrace = trace as Record<string, unknown>;
    const type = typeof typedTrace.type === "string" ? typedTrace.type : "";
    const name = typeof typedTrace.name === "string" ? typedTrace.name : "";
    const yaxis = typeof typedTrace.yaxis === "string" ? typedTrace.yaxis : "";
    const isVolumeTrace = type === "bar" || name === "거래량" || yaxis === "y2";

    if (type === "candlestick") {
      return normalizeCandlestickTrace(typedTrace);
    }

    if (isVolumeTrace) {
      const marker = (typedTrace.marker as Record<string, unknown>) ?? {};
      return {
        ...typedTrace,
        name: "",
        showlegend: false,
        marker: {
          ...marker,
          color: resolveVolumeMarkerColor(marker),
        },
      };
    }

    if (isLineTrace(type)) {
      return normalizeIndicatorTrace(typedTrace);
    }

    return trace;
  });
}

function normalizeCandlestickTrace(
  trace: Record<string, unknown>,
): Record<string, unknown> {
  const increasing = (trace.increasing as Record<string, unknown>) ?? {};
  const decreasing = (trace.decreasing as Record<string, unknown>) ?? {};
  const increasingLine =
    (increasing.line as Record<string, unknown> | undefined) ?? {};
  const decreasingLine =
    (decreasing.line as Record<string, unknown> | undefined) ?? {};

  return {
    ...trace,
    name: "주가",
    hoverlabel: {
      bgcolor: "rgba(255,255,255,0.98)",
      bordercolor: "#cbd5e1",
    },
    hovertemplate:
      "<b>주가</b><br>" +
      "시가 <b>%{open:,.0f}</b>원<br>" +
      "고가 <b>%{high:,.0f}</b>원<br>" +
      "저가 <b>%{low:,.0f}</b>원<br>" +
      "종가 <b>%{close:,.0f}</b>원" +
      "<extra></extra>",
    increasing: { ...increasing, line: { ...increasingLine, width: 1 } },
    decreasing: { ...decreasing, line: { ...decreasingLine, width: 1 } },
  };
}

function resolveVolumeMarkerColor(marker: Record<string, unknown>) {
  const color = marker.color;
  if (Array.isArray(color) && color.length > 0) return color;
  if (typeof color === "string" && color.trim().length > 0) return color;
  return "#94a3b8";
}

function normalizeLineData(data: unknown[]): unknown[] {
  return data.map((trace) => {
    if (!trace || typeof trace !== "object") return trace;

    const typedTrace = trace as Record<string, unknown>;
    const type = typeof typedTrace.type === "string" ? typedTrace.type : "";
    if (type && !isLineTrace(type)) return trace;

    // fillcolor 키 자체를 제거해야 Plotly가 fill을 무시함
    const { fillcolor: _, ...rest } = typedTrace;
    return {
      ...rest,
      fill: "none",
      ...buildIndicatorHoverProps(typedTrace),
    };
  });
}

function normalizeIndicatorTrace(
  trace: Record<string, unknown>,
): Record<string, unknown> {
  return {
    ...trace,
    ...buildIndicatorHoverProps(trace),
  };
}

function buildIndicatorHoverProps(trace: Record<string, unknown>) {
  const rawName = typeof trace.name === "string" ? trace.name : "";
  const displayName = normalizeIndicatorName(rawName);
  const line = (trace.line as Record<string, unknown> | undefined) ?? {};
  const lineColor =
    typeof line.color === "string" && line.color.trim().length > 0
      ? line.color
      : "#475569";

  return {
    name: displayName,
    line: {
      ...line,
      shape: isMovingAverageIndicator(displayName) ? "spline" : line.shape,
      smoothing: isMovingAverageIndicator(displayName) ? 0.7 : line.smoothing,
    },
    hoverlabel: {
      bgcolor: "rgba(255,255,255,0.98)",
      bordercolor: lineColor,
    },
    hovertemplate:
      `<span style="color:${lineColor};">●</span> <b>${displayName}</b> ` +
      `<b>%{y:,.0f}</b>원<extra></extra>`,
  };
}

function normalizeIndicatorName(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return "지표";

  const compact = trimmed.replace(/\s+/g, "").toUpperCase();

  const maMatch = compact.match(/MA(\d+)/);
  if (maMatch) return `MA${maMatch[1]}`;

  const numberMatch = compact.match(/(\d+)/);
  if (compact.includes("이동평균") && numberMatch) return `MA${numberMatch[1]}`;

  return trimmed;
}

function isLineTrace(type: string) {
  return type === "scatter" || type === "line" || type === "scattergl";
}

function isMovingAverageIndicator(name: string) {
  return /^MA\d+$/i.test(name.trim());
}

// ─────────────────────────────────────────────
// 주봉 거래량 변환
// ─────────────────────────────────────────────

function convertToWeeklyVolume(
  dates: unknown[],
  volumes: number[],
  originalTrace: Record<string, unknown>,
): Record<string, unknown> {
  const marker = originalTrace.marker as Record<string, unknown> | undefined;
  const colors = Array.isArray(
    (marker as Record<string, unknown> | undefined)?.color,
  )
    ? ((marker as Record<string, unknown>).color as unknown[])
    : [];

  const weeklyMap = new Map<
    string,
    { volume: number; color: string; date: string }
  >();

  dates.forEach((date, index) => {
    const d = new Date(String(date));
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    const weekKey = monday.toISOString().split("T")[0];

    if (!weeklyMap.has(weekKey)) {
      weeklyMap.set(weekKey, { volume: 0, color: "", date: weekKey });
    }

    const weekData = weeklyMap.get(weekKey)!;
    weekData.volume += volumes[index] || 0;
    if (colors[index]) {
      weekData.color = colors[index] as string;
    }
  });

  const weeklyArray = Array.from(weeklyMap.values()).sort((a, b) =>
    a.date.localeCompare(b.date),
  );

  return {
    ...originalTrace,
    x: weeklyArray.map((w) => w.date),
    y: weeklyArray.map((w) => w.volume),
    marker: {
      ...(typeof marker === "object" ? marker : {}),
      color: weeklyArray.map((w) => w.color || "#94a3b8"),
    },
  };
}

// ─────────────────────────────────────────────
// RSI 가이드라인
// ─────────────────────────────────────────────

function findRsiTrace(data: unknown[]) {
  const traces = data.filter(
    (trace): trace is Record<string, unknown> =>
      Boolean(trace) && typeof trace === "object",
  );

  const namedRsiTrace = traces.find((trace) => {
    const name = typeof trace.name === "string" ? trace.name : "";
    return /(^|\s)RSI(\s|$)/i.test(name);
  });

  if (namedRsiTrace) {
    return namedRsiTrace;
  }

  const subplotRsiTrace = traces.find((trace) => {
    const type = typeof trace.type === "string" ? trace.type : "";
    const xaxis = typeof trace.xaxis === "string" ? trace.xaxis : "";
    const yaxis = typeof trace.yaxis === "string" ? trace.yaxis : "";
    const name = typeof trace.name === "string" ? trace.name.trim() : "";

    return (
      isLineTrace(type) &&
      xaxis === "x2" &&
      yaxis === "y2" &&
      name.length === 0
    );
  });

  if (subplotRsiTrace) {
    return subplotRsiTrace;
  }

  return traces.find((trace) => {
    const type = typeof trace.type === "string" ? trace.type : "";
    const yaxis = typeof trace.yaxis === "string" ? trace.yaxis : "";
    const name = typeof trace.name === "string" ? trace.name.trim() : "";

    return isLineTrace(type) && yaxis === "y2" && name.length === 0;
  });
}

function buildRsiGuideShapesFromTrace(rsiTrace: Record<string, unknown>) {
  const yaxis = typeof rsiTrace.yaxis === "string" ? rsiTrace.yaxis : "y";
  const yref = yaxis === "y" ? "y" : yaxis.replace("axis", "");

  return [
    buildRsiGuideShape(yref, 70, "#ef4444"),
    buildRsiGuideShape(yref, 30, "#22c55e"),
  ];
}

function buildRsiGuideShape(yref: string, y: number, color: string) {
  return {
    __rsiGuide: true,
    type: "line",
    xref: "paper",
    x0: 0,
    x1: 1,
    yref,
    y0: y,
    y1: y,
    line: { color, width: 1, dash: "dot" },
  };
}

function buildRsiGuideAnnotationsFromTrace(rsiTrace: Record<string, unknown>) {
  const yaxis = typeof rsiTrace.yaxis === "string" ? rsiTrace.yaxis : "y";
  const yref = yaxis === "y" ? "y" : yaxis.replace("axis", "");

  return [
    buildRsiGuideAnnotation(yref, 70, "70", "#ef4444"),
    buildRsiGuideAnnotation(yref, 30, "30", "#22c55e"),
  ];
}

function buildRsiGuideAnnotation(
  yref: string,
  y: number,
  text: string,
  color: string,
) {
  return {
    __rsiGuide: true,
    xref: "paper",
    x: 1,
    xanchor: "left",
    xshift: 6,
    yref,
    y,
    yanchor: "middle",
    text,
    showarrow: false,
    font: { size: 11, color },
    bgcolor: "rgba(255,255,255,0.92)",
    bordercolor: color,
    borderwidth: 1,
    borderpad: 3,
  };
}

// ─────────────────────────────────────────────
// 최고/최저 annotation
// ─────────────────────────────────────────────

function buildCandlestickExtremes(data: unknown[]) {
  const candle = data.find((trace) => {
    if (!trace || typeof trace !== "object") return false;
    return (trace as Record<string, unknown>).type === "candlestick";
  }) as Record<string, unknown> | undefined;

  if (candle) {
    const lows = toNumberArray(candle.low);
    const highs = toNumberArray(candle.high);
    const xs = toArray(candle.x);
    if (!lows.length || !highs.length) return null;
    const { minValue, minIndex, minX } = extractMinPoint(lows, xs);
    const { maxValue, maxIndex, maxX } = extractMaxPoint(highs, xs);

    return buildExtremesAnnotations({
      minValue,
      minIndex,
      minX,
      maxValue,
      maxIndex,
      maxX,
      totalPoints: xs.length || highs.length,
    });
  }

  const line = data.find((trace) => {
    if (!trace || typeof trace !== "object") return false;
    const typed = trace as Record<string, unknown>;
    const type = typeof typed.type === "string" ? typed.type : "";
    if (type && !isLineTrace(type)) return false;
    return Array.isArray(typed.y);
  }) as Record<string, unknown> | undefined;

  if (!line) return null;

  const ys = toNumberArray(line.y);
  const xs = toArray(line.x);
  if (!ys.length) return null;
  const { minValue, minIndex, minX } = extractMinPoint(ys, xs);
  const { maxValue, maxIndex, maxX } = extractMaxPoint(ys, xs);

  return buildExtremesAnnotations({
    minValue,
    minIndex,
    minX,
    maxValue,
    maxIndex,
    maxX,
    totalPoints: xs.length || ys.length,
  });
}

function extractMinPoint(values: number[], xs: unknown[]) {
  const minValue = Math.min(...values);
  const minIndex = values.indexOf(minValue);
  return { minValue, minIndex, minX: xs[minIndex] ?? minIndex };
}

function extractMaxPoint(values: number[], xs: unknown[]) {
  const maxValue = Math.max(...values);
  const maxIndex = values.indexOf(maxValue);
  return { maxValue, maxIndex, maxX: xs[maxIndex] ?? maxIndex };
}

function buildExtremesAnnotations({
  minValue,
  maxValue,
  minIndex,
  maxIndex,
  minX,
  maxX,
  totalPoints,
}: {
  minValue: number;
  maxValue: number;
  minIndex: number;
  maxIndex: number;
  minX: unknown;
  maxX: unknown;
  totalPoints: number;
}) {
  const threshold = 0.4;
  const isMinNearRight = minIndex > totalPoints * (1 - threshold);
  const isMaxNearRight = maxIndex > totalPoints * (1 - threshold);

  const baseStyle = {
    showarrow: true,
    arrowhead: 2,
    ax: 0,
    font: { size: 11, color: "#64748b" },
    bgcolor: "rgba(255,255,255,0.9)",
    bordercolor: "rgba(148,163,184,0.6)",
    borderwidth: 1,
  };

  return [
    {
      ...baseStyle,
      x: minX,
      y: minValue,
      xanchor: isMinNearRight ? "right" : "left",
      yanchor: "bottom",
      text: `최저 ${formatWon(minValue)}`,
      ay: 24,
    },
    {
      ...baseStyle,
      x: maxX,
      y: maxValue,
      xanchor: isMaxNearRight ? "right" : "left",
      yanchor: "top",
      text: `최고 ${formatWon(maxValue)}`,
      ay: -24,
    },
  ];
}

// ─────────────────────────────────────────────
// 공통 유틸
// ─────────────────────────────────────────────

/**
 * 기존 배열에서 markerKey가 true인 항목을 제거하고 additions를 뒤에 붙임.
 * markerKey를 생략하면 필터 없이 단순 concat.
 */
function mergeByMarker<T extends Record<string, unknown>>(
  existing: unknown[],
  additions: T[],
  markerKey?: string,
): T[] {
  const filtered = markerKey
    ? existing.filter(
        (item) =>
          !item ||
          typeof item !== "object" ||
          (item as Record<string, unknown>)[markerKey] !== true,
      )
    : existing;

  return [...filtered, ...additions] as T[];
}

function toNumberArray(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === "number" ? item : Number(item)))
    .filter((item) => Number.isFinite(item));
}

function toArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function formatWon(value: number) {
  return `${Math.round(value).toLocaleString("ko-KR")}원`;
}
