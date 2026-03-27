import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ChartPanel, {
  type ChartRange,
  type ChartType,
} from "@/components/ChartPanel";
import { useStockChartQuery } from "@/hooks/queries/useStockChartQuery";
import {
  useHoldingsQuery,
  useStocksListQuery,
  useStockWatchlistQuery,
} from "@/hooks/queries/useStocksListQueries";
import SearchBar from "@/pages/Stocks/components/SearchBar";
import StocksList from "@/pages/Stocks/components/StocksList";
import StocksTab, { type StockTab } from "@/pages/Stocks/components/StocksTab";
import type { StockItem, StockSort } from "@/types/stocks";

const STOCK_SORT_OPTIONS: { value: StockSort; label: string }[] = [
  // { value: "price", label: "주가순" },
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
  const [watchlistItemsByTicker, setWatchlistItemsByTicker] = useState<
    Record<string, StockItem>
  >({});
  const [range, setRange] = useState<ChartRange>("1d");
  const [chartType, setChartType] = useState<ChartType>("candlestick");
  const [sortBy, setSortBy] = useState<StockSort>("change_rate");
  const [searchTerm, setSearchTerm] = useState("");
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

  const listSort = ["price", "change_rate", "volume"].includes(sortBy)
    ? (sortBy as "price" | "change_rate" | "volume")
    : "change_rate";
  const holdingsSort =
    sortBy === "profit_rate" || sortBy === "name"
      ? (sortBy as "profit_rate" | "name")
      : "eval_amount";

  const stocksListQuery = useStocksListQuery({
    market: "ALL",
    sort: listSort,
    order: "desc",
    enabled: activeTab === "all",
  });
  const watchlistQuery = useStockWatchlistQuery({
    userId: "demo_user",
    enabled: activeTab === "watchlist",
  });
  const holdingsQuery = useHoldingsQuery({
    sort: holdingsSort,
    order: "desc",
    enabled: activeTab === "holding",
  });

  useEffect(() => {
    if (watchlistQuery.stocks.length === 0) {
      return;
    }
    setWatchlistItemsByTicker((prev) => {
      if (Object.keys(prev).length > 0) {
        return prev;
      }
      return watchlistQuery.stocks.reduce<Record<string, StockItem>>(
        (acc, item) => {
          acc[item.ticker] = item;
          return acc;
        },
        {},
      );
    });
  }, [watchlistQuery.stocks]);

  const displayedStocks = useMemo<StockItem[]>(() => {
    if (activeTab === "holding") {
      return holdingsQuery.holdings.map((stock) => ({
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
      return Object.values(watchlistItemsByTicker);
    }

    return stocksListQuery.stocks;
  }, [
    activeTab,
    holdingsQuery.holdings,
    stocksListQuery.stocks,
    watchlistItemsByTicker,
  ]);

  const watchlistedTickers = useMemo(
    () => new Set(Object.keys(watchlistItemsByTicker)),
    [watchlistItemsByTicker],
  );

  const handleToggleWatchlist = (item: StockItem) => {
    setWatchlistItemsByTicker((prev) => {
      if (prev[item.ticker]) {
        const next = { ...prev };
        delete next[item.ticker];
        return next;
      }
      return {
        ...prev,
        [item.ticker]: item,
      };
    });
  };

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

  const isLoading =
    activeTab === "holding"
      ? holdingsQuery.isLoading
      : activeTab === "watchlist"
        ? watchlistQuery.isLoading
        : stocksListQuery.isLoading;
  const error =
    activeTab === "holding"
      ? holdingsQuery.errorMessage
      : activeTab === "watchlist"
        ? watchlistQuery.errorMessage
        : stocksListQuery.errorMessage;

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
  const chartQuery = useStockChartQuery({
    symbol: selectedSymbol,
    range,
    type: chartType,
  });

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
            onToggleWatchlist={handleToggleWatchlist}
            watchlistedTickers={watchlistedTickers}
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
          loading={Boolean(selectedSymbol) && chartQuery.isLoading}
          error={chartQuery.errorMessage}
          plotlyJson={chartQuery.plotlyJson}
          isWatchlisted={watchlistedTickers.has(effectiveSelectedStock.ticker)}
          onToggleWatchlist={() =>
            handleToggleWatchlist(effectiveSelectedStock)
          }
          watchlistAriaLabel={`${effectiveSelectedStock.name} 관심 종목 추가`}
          showWatchlistButton
        />
      ) : (
        <ChartPanel
          symbol="선택된 종목"
          range={range}
          onRangeChange={setRange}
          type={chartType}
          onTypeChange={setChartType}
          loading={Boolean(selectedSymbol) && chartQuery.isLoading}
          error={chartQuery.errorMessage}
          plotlyJson={chartQuery.plotlyJson}
          showWatchlistButton
          watchlistDisabled
          watchlistAriaLabel="종목 선택 후 관심 종목 추가"
        />
      )}
    </div>
  );
}
