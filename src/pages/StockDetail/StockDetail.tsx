import { useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import ChartPanel, {
  type ChartRange,
  type ChartType,
} from "@/components/ChartPanel";
import { useStockChartQuery } from "@/hooks/queries/useStockChartQuery";
import CommunityNewsSection from "@/pages/StockDetail/views/CommunityNewsSection";

type StockInsightTab = "report" | "news" | "community";

export default function StockDetail() {
  const navigate = useNavigate();
  const { stockId } = useParams();
  const [searchParams] = useSearchParams();
  const [range, setRange] = useState<ChartRange>("1d");
  const [chartType, setChartType] = useState<ChartType>("candlestick");
  const [activeInsightTab, setActiveInsightTab] =
    useState<StockInsightTab>("report");

  const symbolLabel = useMemo(() => {
    const nameParam = searchParams.get("name");
    if (nameParam && stockId) {
      return `${decodeURIComponent(nameParam)} (${stockId})`;
    }
    return stockId ? stockId : "선택된 종목";
  }, [searchParams, stockId]);

  const isHolding = true;
  const chartQuery = useStockChartQuery({
    symbol: stockId,
    range,
    type: chartType,
  });

  return (
    <div className="space-y-8 py-8">
      <ChartPanel
        symbol={symbolLabel}
        range={range}
        onRangeChange={setRange}
        type={chartType}
        onTypeChange={setChartType}
        loading={chartQuery.isLoading}
        error={chartQuery.errorMessage}
        plotlyJson={chartQuery.plotlyJson}
      />

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_40px_-32px_rgba(15,23,42,0.6)]">
        <div className="flex w-full">
          <div className="flex w-full items-center gap-2 rounded-full bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setActiveInsightTab("report")}
              className={`flex-1 rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                activeInsightTab === "report"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}>
              종목 리포트
            </button>
            <button
              type="button"
              onClick={() => setActiveInsightTab("news")}
              className={`flex-1 rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                activeInsightTab === "news"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}>
              뉴스
            </button>
            <button
              type="button"
              onClick={() => setActiveInsightTab("community")}
              className={`flex-1 rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                activeInsightTab === "community"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}>
              커뮤니티
            </button>
          </div>
        </div>

        {activeInsightTab === "report" && (
          <div className="mt-6">
            <h4 className="text-base font-semibold text-slate-900">
              종목 리포트
            </h4>
          </div>
        )}

        {activeInsightTab !== "report" && (
          <div className="mt-6">
            <CommunityNewsSection
              symbol={stockId}
              activeTab={activeInsightTab === "news" ? "news" : "community"}
              showContainer={false}
              showHeader={false}
            />
          </div>
        )}
      </section>

      {isHolding && (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_40px_-32px_rgba(15,23,42,0.6)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-slate-900">
              물타기 계산기
            </h3>
            <button
              type="button"
              onClick={() =>
                navigate(
                  `/calculator/${stockId ?? ""}?name=${encodeURIComponent(
                    searchParams.get("name") ?? "",
                  )}`,
                )
              }
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-800">
              계산기 열기
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
