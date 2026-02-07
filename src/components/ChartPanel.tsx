import Plotly from "plotly.js-dist-min";
import { useMemo } from "react";
import createPlotlyComponent from "react-plotly.js/factory";
import LoadingSpinner from "@/components/LoadingSpinner";
import normalizePlotly, {
  type PlotlyFigure,
} from "@/lib/plotly/normalizePlotly";

const Plot = createPlotlyComponent(Plotly);

const RANGE_OPTIONS = [
  { id: "1d", label: "하루" },
  { id: "1m", label: "1달" },
  { id: "3m", label: "3달" },
  { id: "1y", label: "1년" },
] as const;

export type ChartRange = (typeof RANGE_OPTIONS)[number]["id"];

const TYPE_OPTIONS = [
  { id: "candlestick", label: "캔들" },
  { id: "technical", label: "기술" },
  { id: "volume", label: "거래량" },
  { id: "line", label: "라인" },
] as const;

export type ChartType = (typeof TYPE_OPTIONS)[number]["id"];

export type ChartPanelProps = {
  symbol: string;
  range: ChartRange;
  onRangeChange: (range: ChartRange) => void;
  type: ChartType;
  onTypeChange: (type: ChartType) => void;
  loading?: boolean;
  error?: string | null;
  plotlyJson?: unknown | null;
};

export default function ChartPanel({
  symbol,
  range,
  onRangeChange,
  type,
  onTypeChange,
  loading = false,
  error = null,
  plotlyJson = null,
}: ChartPanelProps) {
  const rangeLabel = useMemo(
    () => RANGE_OPTIONS.find((option) => option.id === range)?.label ?? "",
    [range],
  );

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_40px_-32px_rgba(15,23,42,0.6)]">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Selected
          </p>
          <h2 className="text-2xl font-semibold text-slate-900">
            {symbol} 차트
          </h2>
          <p className="text-sm text-slate-500">{rangeLabel} 기준</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <TypeTabs value={type} onChange={onTypeChange} />
          <RangeTabs value={range} onChange={onRangeChange} />
        </div>
      </header>

      <div className="mt-6">
        <ChartRenderer
          loading={loading}
          error={error}
          plotlyJson={plotlyJson}
          chartType={type}
        />
      </div>
    </section>
  );
}

type RangeTabsProps = {
  value: ChartRange;
  onChange: (range: ChartRange) => void;
};

function RangeTabs({ value, onChange }: RangeTabsProps) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 p-1">
      {RANGE_OPTIONS.map((option) => {
        const isActive = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            className={
              "rounded-full px-4 py-2 text-sm font-semibold transition " +
              (isActive
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-900")
            }
            onClick={() => onChange(option.id)}>
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

type TypeTabsProps = {
  value: ChartType;
  onChange: (type: ChartType) => void;
};

function TypeTabs({ value, onChange }: TypeTabsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-full border border-slate-200 bg-white p-1">
      {TYPE_OPTIONS.map((option) => {
        const isActive = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            className={
              "rounded-full px-3 py-2 text-xs font-semibold transition " +
              (isActive
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-900")
            }
            onClick={() => onChange(option.id)}>
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

type ChartRendererProps = {
  loading: boolean;
  error: string | null;
  plotlyJson: unknown | null;
  chartType: ChartType;
};

function ChartRenderer({
  loading,
  error,
  plotlyJson,
  chartType,
}: ChartRendererProps) {
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50">
        <LoadingSpinner label="차트 로딩 중..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-rose-200 bg-rose-50">
        <p className="text-sm font-semibold text-rose-500">
          차트를 불러오지 못했습니다.
        </p>
        <p className="text-xs text-rose-400">{error}</p>
        <button
          type="button"
          className="rounded-full border border-rose-200 bg-white px-4 py-2 text-xs font-semibold text-rose-500">
          다시 시도
        </button>
      </div>
    );
  }

  if (!plotlyJson) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50">
        <p className="text-sm text-slate-400">표시할 데이터가 없습니다.</p>
      </div>
    );
  }

  const parsedPlotly =
    typeof plotlyJson === "string"
      ? safeParsePlotly(plotlyJson)
      : (plotlyJson as PlotlyFigure | null);

  if (!parsedPlotly?.data) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50">
        <p className="text-sm text-slate-400">
          Plotly 데이터를 해석할 수 없습니다.
        </p>
      </div>
    );
  }

  // Debug: inspect raw plotly payload from server before any normalization.
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.info("[ChartPanel] Raw Plotly JS", plotlyJson);
    // eslint-disable-next-line no-console
    console.info("[ChartPanel] Raw Plotly parsed", parsedPlotly);
  }

  const normalizedPlotly = normalizePlotly(parsedPlotly, {
    chartType,
  });

  return (
    <div className="h-95 rounded-2xl border border-slate-200 bg-white">
      {chartType === "candlestick" && (
        <div className="legend ml-3 mt-2 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
          <span>이동평균선</span>
          <span style={{ color: "#FF9500" }}>5</span>
          <span style={{ color: "#34C759" }}>20</span>
          <span style={{ color: "#AF52DE" }}>60</span>
        </div>
      )}
      <Plot
        data={normalizedPlotly.data}
        layout={{
          ...(normalizedPlotly.layout ?? {}),
          autosize: true,
          margin: {
            l: 40,
            r: 24,
            t: 24,
            b: 56,
            ...((normalizedPlotly.layout?.margin ?? {}) as Record<
              string,
              unknown
            >),
          },
        }}
        config={{ responsive: true, displayModeBar: false }}
        useResizeHandler
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}

function safeParsePlotly(value: string) {
  try {
    return JSON.parse(value) as {
      data?: unknown[];
      layout?: Record<string, unknown>;
    };
  } catch {
    return null;
  }
}
