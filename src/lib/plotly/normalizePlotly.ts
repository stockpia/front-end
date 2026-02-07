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
  return figure;
}

function normalizeLine(figure: PlotlyFigure): PlotlyFigure {
  return figure;
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
      const existing = Array.isArray(nextLayout?.annotations)
        ? nextLayout?.annotations
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
): PlotlyFigure["layout"] {
  if (!layout) {
    layout = {};
  }

  const nextLayout: Record<string, unknown> = { ...layout };
  const axisKeys = Object.keys(nextLayout).filter((key) =>
    /^xaxis\d*$/.test(key),
  );
  const yAxisKeys = Object.keys(nextLayout).filter((key) =>
    /^yaxis\d*$/.test(key),
  );

  if (axisKeys.length === 0) {
    nextLayout.xaxis = stripAxisLabels(
      nextLayout.xaxis as Record<string, unknown>,
    );
  } else {
    axisKeys.forEach((key) => {
      nextLayout[key] = stripAxisLabels(
        nextLayout[key] as Record<string, unknown>,
      );
    });
  }

  if (yAxisKeys.length === 0) {
    nextLayout.yaxis = stripAxisLabels(
      nextLayout.yaxis as Record<string, unknown>,
    );
  } else {
    yAxisKeys.forEach((key) => {
      nextLayout[key] = stripAxisLabels(
        nextLayout[key] as Record<string, unknown>,
      );
    });
  }

  return nextLayout;
}

function stripAxisLabels(axis?: Record<string, unknown>) {
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

function buildCandlestickExtremes(data: unknown[]) {
  const candle = data.find((trace) => {
    if (!trace || typeof trace !== "object") {
      return false;
    }
    return (trace as Record<string, unknown>).type === "candlestick";
  }) as Record<string, unknown> | undefined;

  if (!candle) {
    return null;
  }

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

  const totalPoints = xs.length;
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
