import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ChartPanel, {
  type ChartRange,
  type ChartType,
} from "@/components/ChartPanel";
import {
  fetchHoldings,
  fetchStockChart,
  fetchStocksList,
  fetchStockWatchlist,
  type HoldingsStock,
} from "@/lib/api/stocks";
import SearchBar from "@/pages/Stocks/components/SearchBar";
import StocksList from "@/pages/Stocks/components/StocksList";
import type {
  StockChartRange,
  StockChartType,
  StockItem,
  StockSort,
} from "@/types/stocks";
import StocksTab, { type StockTab } from "@/pages/Stocks/components/StocksTab";

const STOCK_SORT_OPTIONS: { value: StockSort; label: string }[] = [
  { value: "price", label: "주가순" },
  { value: "change_rate", label: "상승률순" },
  { value: "volume", label: "거래량순" },
];

const HOLDING_SORT_OPTIONS: { value: StockSort; label: string }[] = [
  { value: "eval_amount", label: "평가금액순" },
  { value: "profit_rate", label: "수익률순" },
  { value: "name", label: "종목명순" },
];

export default function Stocks() {
  const [activeTab, setActiveTab] = useState<StockTab>("all");
  const [selectedStock, setSelectedStock] = useState<StockItem | null>(null);
  const [userSelectedTicker, setUserSelectedTicker] = useState<string | null>(
    null,
  );
  const [range, setRange] = useState<ChartRange>("1d");
  const [chartType, setChartType] = useState<ChartType>("candlestick");
  const [sortBy, setSortBy] = useState<StockSort>("change_rate");
  const [searchTerm, setSearchTerm] = useState("");
  const [allStocks, setAllStocks] = useState<StockItem[]>([]);
  const [watchlistStocks, setWatchlistStocks] = useState<StockItem[]>([]);
  const [holdings, setHoldings] = useState<HoldingsStock[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chartLoading, setChartLoading] = useState(false);
  const [chartError, setChartError] = useState<string | null>(null);
  const [chartPlotly, setChartPlotly] = useState<unknown | null>(null);
  const navigate = useNavigate();

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

  const handleTabChange = (nextTab: StockTab) => {
    setActiveTab(nextTab);
    setSortBy(nextTab === "holding" ? "eval_amount" : "change_rate");
  };

  const displayedStocks = useMemo<StockItem[]>(() => {
    if (activeTab === "holding") {
      return holdings.map((stock) => ({
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

    if (activeTab === "watchlist") {
      return watchlistStocks;
    }

    return allStocks;
  }, [activeTab, allStocks, holdings, watchlistStocks]);

  const normalizedSearchTerm = useMemo(
    () => searchTerm.trim().toLowerCase(),
    [searchTerm],
  );

  const filteredStocks = useMemo(() => {
    if (!normalizedSearchTerm) {
      return displayedStocks;
    }

    return displayedStocks.filter((stock) => {
      const name = stock.name.toLowerCase();
      const ticker = stock.ticker.toLowerCase();
      return name === normalizedSearchTerm || ticker === normalizedSearchTerm;
    });
  }, [displayedStocks, normalizedSearchTerm]);

  const sortedStocks = useMemo(() => {
    if (activeTab !== "holding") {
      return filteredStocks;
    }

    const sorted = [...filteredStocks];
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
      case "name":
        return sorted.sort((a, b) => a.name.localeCompare(b.name, "ko"));
      default:
        return sorted.sort((a, b) => b.current_price - a.current_price);
    }
  }, [activeTab, filteredStocks, sortBy]);

  useEffect(() => {
    const controller = new AbortController();
    const listSort = ["price", "change_rate", "volume"].includes(sortBy)
      ? (sortBy as "price" | "change_rate" | "volume")
      : "change_rate";

    setIsLoading(true);
    setError(null);

    if (activeTab === "holding") {
      fetchHoldings(
        {
          sort:
            sortBy === "profit_rate" || sortBy === "name"
              ? (sortBy as "profit_rate" | "name")
              : "eval_amount",
          order: "desc",
        },
        controller.signal,
      )
        .then((response) => {
          setHoldings(response.stocks ?? []);
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
    }

    if (activeTab === "watchlist") {
      fetchStockWatchlist("demo_user", controller.signal)
        .then((response) => {
          setWatchlistStocks(response.stocks ?? []);
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
    }

    fetchStocksList(
      {
        market: "ALL",
        sort: listSort,
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
    setUserSelectedTicker(null);
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
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          onSubmit={() => {
            const normalized = searchTerm.trim();
            setSearchTerm(normalized);
          }}
        />
        <div className="mt-6">
          <StocksTab value={activeTab} onChange={handleTabChange} />
        </div>
        <div className="mt-6">
          <StocksList
            title={listTitle}
            items={sortedStocks}
            selectedId={effectiveSelectedStock?.ticker ?? ""}
            onSelect={(item) => {
              if (
                item.ticker === effectiveSelectedStock?.ticker &&
                userSelectedTicker === item.ticker
              ) {
                const nameParam = encodeURIComponent(item.name);
                navigate(`/stocks/${item.ticker}?name=${nameParam}`);
                return;
              }
              setSelectedStock(item);
              setUserSelectedTicker(item.ticker);
            }}
            sortBy={sortBy}
            onSortChange={setSortBy}
            sortOptions={
              activeTab === "holding"
                ? HOLDING_SORT_OPTIONS
                : STOCK_SORT_OPTIONS
            }
            metaLabel={activeTab === "holding" ? "보유량" : "거래량"}
            isLoading={isLoading}
            error={error}
            emptyLabel={normalizedSearchTerm ? "없는 종목입니다." : undefined}
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
