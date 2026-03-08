import type { StockChartType } from "@/types/stocks";

export type PlotlyFigure = {
  data?: unknown[];
  layout?: Record<string, unknown>;
};

type NormalizeOptions = {
  chartType?: StockChartType;
};

export default function normalizePlotly(
  figure: PlotlyFigure,
  { chartType }: NormalizeOptions = {},
): PlotlyFigure {
  switch (chartType) {
    case "candlestick":
      return normalizeCandlestick(figure);
    case "technical":
      return normalizeTechnical(figure);
    case "volume":
      return normalizeVolume(figure);
    case "line":
      return normalizeLine(figure);
    default:
      return figure;
  }
}

function normalizeCandlestick(figure: PlotlyFigure): PlotlyFigure {
  return normalizeCandlestickLike(figure, { withExtremes: true });
}

function normalizeTechnical(figure: PlotlyFigure): PlotlyFigure {
  return normalizeCandlestickLike(figure, { withExtremes: false });
}

function normalizeVolume(figure: PlotlyFigure): PlotlyFigure {
  if (!figure.data || !Array.isArray(figure.data)) {
    return figure;
  }

  // 거래량 데이터 찾기
  const volumeTrace = figure.data.find((trace) => {
    if (!trace || typeof trace !== "object") {
      return false;
    }
    const typed = trace as Record<string, unknown>;
    return typed.type === "bar" || typed.name === "거래량";
  }) as Record<string, unknown> | undefined;

  if (!volumeTrace) {
    return figure;
  }

  const xs = toArray(volumeTrace.x);
  const ys = toNumberArray(volumeTrace.y);

  // 데이터 포인트가 200개 이상이면 주봉으로 변환
  if (xs.length >= 80) {
    const weeklyData = convertToWeeklyVolume(xs, ys, volumeTrace);
    return {
      ...figure,
      data: figure.data.map((trace) => {
        if (trace === volumeTrace) {
          return weeklyData;
        }
        return trace;
      }),
    };
  }

  return figure;
}

function convertToWeeklyVolume(
  dates: unknown[],
  volumes: number[],
  originalTrace: Record<string, unknown>,
): Record<string, unknown> {
  const weeklyMap = new Map<
    string,
    { volume: number; color: string; date: string }
  >();

  dates.forEach((date, index) => {
    const dateStr = String(date);
    const volume = volumes[index] || 0;

    const d = new Date(dateStr);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    const weekKey = monday.toISOString().split("T")[0];

    if (!weeklyMap.has(weekKey)) {
      weeklyMap.set(weekKey, {
        volume: 0,
        color: "",
        date: weekKey,
      });
    }

    const weekData = weeklyMap.get(weekKey)!;
    weekData.volume += volume;

    const colors = Array.isArray(originalTrace.marker)
      ? (originalTrace.marker as any).color
      : (originalTrace.marker as Record<string, unknown>)?.color;

    if (Array.isArray(colors) && colors[index]) {
      weekData.color = colors[index];
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
      ...(typeof originalTrace.marker === "object" ? originalTrace.marker : {}),
      color: weeklyArray.map((w) => w.color || "#94a3b8"),
    },
  };
}

function normalizeLine(figure: PlotlyFigure): PlotlyFigure {
  const nextLayout = normalizeCandlestickLayout(figure.layout);
  const nextData = normalizeLineData(figure.data ?? []);
  const extremeAnnotations = buildCandlestickExtremes(nextData);
  if (extremeAnnotations) {
    const existing = Array.isArray(nextLayout.annotations)
      ? nextLayout.annotations
      : [];
    nextLayout.annotations = [...existing, ...extremeAnnotations];
  }
  return {
    ...figure,
    data: nextData,
    layout: nextLayout,
  };
}

function normalizeCandlestickLike(
  figure: PlotlyFigure,
  { withExtremes }: { withExtremes: boolean },
): PlotlyFigure {
  const nextLayout = normalizeCandlestickLayout(figure.layout);
  const nextData = normalizeCandlestickData(figure.data ?? []);

  if (withExtremes) {
    const extremeAnnotations = buildCandlestickExtremes(nextData);
    if (extremeAnnotations) {
      const existing = Array.isArray(nextLayout.annotations)
        ? nextLayout.annotations
        : [];
      nextLayout.annotations = [...existing, ...extremeAnnotations];
    }
  }

  return {
    ...figure,
    data: nextData,
    layout: nextLayout,
  };
}

function normalizeCandlestickLayout(
  layout: PlotlyFigure["layout"],
): Record<string, unknown> {
  if (!layout) {
    layout = {};
  }

  const nextLayout: Record<string, unknown> = { ...layout };
  nextLayout.showlegend = false;
  const axisKeys = Object.keys(nextLayout).filter((key) =>
    /^xaxis\d*$/.test(key),
  );
  const yAxisKeys = Object.keys(nextLayout).filter((key) =>
    /^yaxis\d*$/.test(key),
  );

  if (axisKeys.length === 0) {
    nextLayout.xaxis = normalizeXAxis(
      nextLayout.xaxis as Record<string, unknown>,
    );
  } else {
    axisKeys.forEach((key) => {
      nextLayout[key] = normalizeXAxis(
        nextLayout[key] as Record<string, unknown>,
      );
    });
  }

  if (yAxisKeys.length === 0) {
    nextLayout.yaxis = normalizeYAxis(nextLayout.yaxis as Record<string, unknown>);
  } else {
    yAxisKeys.forEach((key) => {
      nextLayout[key] = normalizeYAxis(
        nextLayout[key] as Record<string, unknown>,
      );
    });
  }

  const axisTitleAnnotations = buildYAxisTitleAnnotations(nextLayout, yAxisKeys);
  if (axisTitleAnnotations.length) {
    const existing = Array.isArray(nextLayout.annotations)
      ? nextLayout.annotations
      : [];
    const withoutAxisTitleAnnotations = existing.filter((annotation) => {
      if (!annotation || typeof annotation !== "object") {
        return true;
      }
      return (annotation as Record<string, unknown>).__axisTitle !== true;
    });
    nextLayout.annotations = [
      ...withoutAxisTitleAnnotations,
      ...axisTitleAnnotations,
    ];
  }

  const margin = (nextLayout.margin as Record<string, unknown>) ?? {};
  const left = typeof margin.l === "number" ? margin.l : 0;
  const right = typeof margin.r === "number" ? margin.r : 0;
  nextLayout.margin = {
    ...margin,
    l: Math.max(left, 56),
    r: Math.max(right, 56),
  };

  return nextLayout;
}

function normalizeXAxis(axis?: Record<string, unknown>) {
  const cleaned = { ...(axis ?? {}) };
  delete cleaned.title;

  return {
    ...cleaned,
    showticklabels: false,
    ticks: "",
    ticktext: [],
    tickvals: [],
  };
}

function normalizeYAxis(axis?: Record<string, unknown>) {
  const cleaned = { ...(axis ?? {}) };
  delete cleaned.title;

  return {
    ...cleaned,
    showticklabels: false,
    ticks: "",
    ticktext: [],
    tickvals: [],
  };
}

function buildYAxisTitleAnnotations(
  layout: Record<string, unknown>,
  yAxisKeys: string[],
) {
  const keys = yAxisKeys.length > 0 ? yAxisKeys : ["yaxis"];

  return keys.map((axisKey) => {
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
      text: axisKey === "yaxis2" ? "거래량" : "주가",
      showarrow: false,
      font: { size: 12, color: "#334155" },
    };
  });
}

function normalizeCandlestickData(data: unknown[]): unknown[] {
  return data.map((trace) => {
    if (!trace || typeof trace !== "object") {
      return trace;
    }
    const typedTrace = trace as Record<string, unknown>;
    const type = typeof typedTrace.type === "string" ? typedTrace.type : "";
    const name = typeof typedTrace.name === "string" ? typedTrace.name : "";
    const yaxis = typeof typedTrace.yaxis === "string" ? typedTrace.yaxis : "";
    const isVolumeTrace = type === "bar" || name === "거래량" || yaxis === "y2";

    if (isVolumeTrace) {
      const marker = (typedTrace.marker as Record<string, unknown>) ?? {};
      return {
        ...typedTrace,
        name: "",
        showlegend: false,
        marker: {
          ...marker,
          color: "#94a3b8",
        },
      };
    }

    return trace;
  });
}

function normalizeLineData(data: unknown[]): unknown[] {
  return data.map((trace) => {
    if (!trace || typeof trace !== "object") {
      return trace;
    }
    const typedTrace = trace as Record<string, unknown>;
    const type = typeof typedTrace.type === "string" ? typedTrace.type : "";
    if (type && type !== "scatter" && type !== "line" && type !== "scattergl") {
      return trace;
    }

    return {
      ...typedTrace,
      fill: "none",
      fillcolor: undefined,
    };
  });
}

function buildCandlestickExtremes(data: unknown[]) {
  const candle = data.find((trace) => {
    if (!trace || typeof trace !== "object") {
      return false;
    }
    return (trace as Record<string, unknown>).type === "candlestick";
  }) as Record<string, unknown> | undefined;

  if (candle) {
    const lows = toNumberArray(candle.low);
    const highs = toNumberArray(candle.high);
    const xs = toArray(candle.x);

    if (!lows.length || !highs.length) {
      return null;
    }

    const minValue = Math.min(...lows);
    const maxValue = Math.max(...highs);
    const minIndex = lows.indexOf(minValue);
    const maxIndex = highs.indexOf(maxValue);

    const minX = xs[minIndex] ?? minIndex;
    const maxX = xs[maxIndex] ?? maxIndex;

    return buildExtremesAnnotations({
      minValue,
      maxValue,
      minIndex,
      maxIndex,
      minX,
      maxX,
      totalPoints: xs.length || highs.length,
    });
  }

  const line = data.find((trace) => {
    if (!trace || typeof trace !== "object") {
      return false;
    }
    const typed = trace as Record<string, unknown>;
    const type = typeof typed.type === "string" ? typed.type : "";
    if (type && type !== "scatter" && type !== "line" && type !== "scattergl") {
      return false;
    }
    return Array.isArray(typed.y);
  }) as Record<string, unknown> | undefined;

  if (!line) {
    return null;
  }

  const ys = toNumberArray(line.y);
  const xs = toArray(line.x);

  if (!ys.length) {
    return null;
  }

  const minValue = Math.min(...ys);
  const maxValue = Math.max(...ys);
  const minIndex = ys.indexOf(minValue);
  const maxIndex = ys.indexOf(maxValue);

  const minX = xs[minIndex] ?? minIndex;
  const maxX = xs[maxIndex] ?? maxIndex;

  return buildExtremesAnnotations({
    minValue,
    maxValue,
    minIndex,
    maxIndex,
    minX,
    maxX,
    totalPoints: xs.length || ys.length,
  });
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

  return [
    {
      x: minX,
      y: minValue,
      xanchor: isMinNearRight ? "right" : "left",
      yanchor: "bottom",
      text: `최저 ${formatWon(minValue)}`,
      showarrow: true,
      arrowhead: 2,
      ax: 0,
      ay: 24,
      font: { size: 11, color: "#64748b" },
      bgcolor: "rgba(255,255,255,0.9)",
      bordercolor: "rgba(148,163,184,0.6)",
      borderwidth: 1,
    },
    {
      x: maxX,
      y: maxValue,
      xanchor: isMaxNearRight ? "right" : "left",
      yanchor: "top",
      text: `최고 ${formatWon(maxValue)}`,
      showarrow: true,
      arrowhead: 2,
      ax: 0,
      ay: -24,
      font: { size: 11, color: "#64748b" },
      bgcolor: "rgba(255,255,255,0.9)",
      bordercolor: "rgba(148,163,184,0.6)",
      borderwidth: 1,
    },
  ];
}

function toNumberArray(value: unknown): number[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map((item) => (typeof item === "number" ? item : Number(item)))
    .filter((item) => Number.isFinite(item)) as number[];
}

function toArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function formatWon(value: number) {
  return `${Math.round(value).toLocaleString("ko-KR")}원`;
}
