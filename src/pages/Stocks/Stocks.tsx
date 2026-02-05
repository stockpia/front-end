import { useEffect, useMemo, useState } from "react";
import ChartPanel, { type ChartRange, type ChartType } from "@/components/ChartPanel";
import {
  fetchStockChart,
  fetchStocksList,
  type StockChartRange,
  type StockChartType,
} from "@/lib/api/stocks";
import SearchBar from "@/pages/Stocks/components/SearchBar";
import StocksList, {
  type StockItem,
  type StockSort,
} from "@/pages/Stocks/components/StocksList";
import StocksTab, { type StockTab } from "@/pages/Stocks/components/StocksTab";
import holdingsResponse from "@/pages/Stocks/mock/holdings.json";

type HoldingsStock = {
  ticker: string;
  name: string;
  quantity: number;
  avg_price: number;
  current_price: number;
  eval_amount: number;
  profit_amount: number;
  profit_rate: number;
};

type HoldingsApiResponse = {
  count: number;
  total_eval_amount: number;
  total_profit_amount: number;
  stocks: HoldingsStock[];
};

const HOLDINGS_RESPONSE = holdingsResponse as HoldingsApiResponse;

const HOLDINGS = HOLDINGS_RESPONSE.stocks;

const STOCK_SORT_OPTIONS: { value: StockSort; label: string }[] = [
  { value: "price", label: "주가순" },
  { value: "change_rate", label: "등락률순" },
  { value: "volume", label: "거래량순" },
];

const HOLDING_SORT_OPTIONS: { value: StockSort; label: string }[] = [
  { value: "eval_amount", label: "평가금액순" },
  { value: "profit_rate", label: "수익률순" },
  { value: "quantity", label: "보유량순" },
];

export default function Stocks() {
  const [activeTab, setActiveTab] = useState<StockTab>("all");
  const [selectedStock, setSelectedStock] = useState<StockItem | null>(null);
  const [range, setRange] = useState<ChartRange>("1d");
  const [chartType, setChartType] = useState<ChartType>("candlestick");
  const [sortBy, setSortBy] = useState<StockSort>("change_rate");
  const [allStocks, setAllStocks] = useState<StockItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chartLoading, setChartLoading] = useState(false);
  const [chartError, setChartError] = useState<string | null>(null);
  const [chartPlotly, setChartPlotly] = useState<unknown | null>(null);

  const listTitle = useMemo(() => {
    switch (activeTab) {
      case "watchlist":
        return "관심 종목";
      case "holding":
        return "보유 종목";
      default:
        return "전체 종목";
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "holding") {
      setSortBy("eval_amount");
    } else {
      setSortBy("change_rate");
    }
  }, [activeTab]);

  const displayedStocks = useMemo<StockItem[]>(() => {
    if (activeTab === "holding") {
      return HOLDINGS.map((stock) => ({
        ticker: stock.ticker,
        name: stock.name,
        current_price: stock.current_price,
        change_rate: stock.profit_rate,
        volume: stock.quantity,
        quantity: stock.quantity,
        eval_amount: stock.eval_amount,
        profit_rate: stock.profit_rate,
      }));
    }

    return allStocks;
  }, [activeTab, allStocks]);

  const sortedStocks = useMemo(() => {
    if (activeTab !== "holding") {
      return displayedStocks;
    }

    const sorted = [...displayedStocks];
    switch (sortBy) {
      case "change_rate":
        return sorted.sort((a, b) => b.change_rate - a.change_rate);
      case "volume":
        return sorted.sort((a, b) => b.volume - a.volume);
      case "eval_amount":
        return sorted.sort(
          (a, b) => (b.eval_amount ?? 0) - (a.eval_amount ?? 0),
        );
      case "profit_rate":
        return sorted.sort(
          (a, b) => (b.profit_rate ?? 0) - (a.profit_rate ?? 0),
        );
      case "quantity":
        return sorted.sort((a, b) => (b.quantity ?? 0) - (a.quantity ?? 0));
      default:
        return sorted.sort((a, b) => b.current_price - a.current_price);
    }
  }, [activeTab, displayedStocks, sortBy]);

  useEffect(() => {
    if (activeTab === "holding") {
      return;
    }

    const controller = new AbortController();
    const sort = ["price", "change_rate", "volume"].includes(sortBy)
      ? (sortBy as "price" | "change_rate" | "volume")
      : "change_rate";

    setIsLoading(true);
    setError(null);

    fetchStocksList(
      {
        market: "ALL",
        sort,
        order: "desc",
      },
      controller.signal,
    )
      .then((response) => {
        setAllStocks(response.stocks ?? []);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) {
          return;
        }
        const message =
          err instanceof Error
            ? err.message
            : "알 수 없는 오류가 발생했습니다.";
        setError(message);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [activeTab, sortBy]);

  useEffect(() => {
    setSelectedStock((prev) => {
      if (sortedStocks.length === 0) {
        return null;
      }
      if (!prev) {
        return sortedStocks[0];
      }
      const stillExists = sortedStocks.some(
        (item) => item.ticker === prev.ticker,
      );
      return stillExists ? prev : sortedStocks[0];
    });
  }, [sortedStocks]);

  const effectiveSelectedStock = selectedStock ?? sortedStocks[0] ?? null;
  const selectedSymbol = effectiveSelectedStock?.ticker ?? null;

  useEffect(() => {
    if (!selectedSymbol) {
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
      selectedSymbol,
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
  }, [selectedSymbol, range, chartType]);

  return (
    <div className="space-y-8 py-8">
      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.6)]">
        <SearchBar />
        <div className="mt-6">
          <StocksTab value={activeTab} onChange={setActiveTab} />
        </div>
        <div className="mt-6">
          <StocksList
            title={listTitle}
            items={sortedStocks}
            selectedId={effectiveSelectedStock?.ticker ?? ""}
            onSelect={(item) => setSelectedStock(item)}
            sortBy={sortBy}
            onSortChange={setSortBy}
            sortOptions={
              activeTab === "holding"
                ? HOLDING_SORT_OPTIONS
                : STOCK_SORT_OPTIONS
            }
            metaLabel={activeTab === "holding" ? "보유량" : "거래량"}
            isLoading={activeTab !== "holding" && isLoading}
            error={activeTab !== "holding" ? error : null}
          />
        </div>
      </section>

      {effectiveSelectedStock ? (
        <ChartPanel
          symbol={`${effectiveSelectedStock.name} (${effectiveSelectedStock.ticker})`}
          range={range}
          onRangeChange={setRange}
          type={chartType}
          onTypeChange={setChartType}
          loading={chartLoading}
          error={chartError}
          plotlyJson={chartPlotly}
        />
      ) : (
        <ChartPanel
          symbol="선택된 종목"
          range={range}
          onRangeChange={setRange}
          type={chartType}
          onTypeChange={setChartType}
          loading={chartLoading}
          error={chartError}
          plotlyJson={chartPlotly}
        />
      )}
    </div>
  );
}
