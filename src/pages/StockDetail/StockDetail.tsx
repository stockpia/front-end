import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import ChartPanel, {
  type ChartRange,
  type ChartType,
} from "@/components/ChartPanel";
import {
  fetchStockChart,
  type StockChartRange,
  type StockChartType,
} from "@/lib/api/stocks";

export default function StockDetail() {
  const { stockId } = useParams();
  const [searchParams] = useSearchParams();
  const [range, setRange] = useState<ChartRange>("1d");
  const [chartType, setChartType] = useState<ChartType>("candlestick");
  const [chartLoading, setChartLoading] = useState(false);
  const [chartError, setChartError] = useState<string | null>(null);
  const [chartPlotly, setChartPlotly] = useState<unknown | null>(null);

  const symbolLabel = useMemo(() => {
    const nameParam = searchParams.get("name");
    if (nameParam && stockId) {
      return `${decodeURIComponent(nameParam)} (${stockId})`;
    }
    return stockId ? stockId : "선택된 종목";
  }, [searchParams, stockId]);

  const isHolding = false;

  useEffect(() => {
    if (!stockId) {
      setChartPlotly(null);
      setChartError(null);
      setChartLoading(false);
      return;
    }

    const controller = new AbortController();
    const chartRange = range as StockChartRange;
    const type = chartType as StockChartType;

    setChartLoading(true);
    setChartError(null);

    fetchStockChart(
      stockId,
      {
        range: chartRange,
        type,
      },
      controller.signal,
    )
      .then((response) => {
        setChartPlotly(response.plotly ?? null);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) {
          return;
        }
        const message =
          err instanceof Error
            ? err.message
            : "알 수 없는 오류가 발생했습니다.";
        setChartError(message);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setChartLoading(false);
        }
      });

    return () => controller.abort();
  }, [stockId, range, chartType]);

  return (
    <div className="space-y-8 py-8">
      <ChartPanel
        symbol={symbolLabel}
        range={range}
        onRangeChange={setRange}
        type={chartType}
        onTypeChange={setChartType}
        loading={chartLoading}
        error={chartError}
        plotlyJson={chartPlotly}
      />

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_40px_-32px_rgba(15,23,42,0.6)]">
        <h3 className="text-lg font-semibold text-slate-900">종목 리포트</h3>
      </section>

      {isHolding && (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_40px_-32px_rgba(15,23,42,0.6)]">
          <h3 className="text-lg font-semibold text-slate-900">
            물타기 계산기
          </h3>
        </section>
      )}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_40px_-32px_rgba(15,23,42,0.6)]">
        <h3 className="text-lg font-semibold text-slate-900">
          커뮤니티 / 뉴스
        </h3>
      </section>
    </div>
  );
}
