import { useEffect, useMemo, useState } from "react";
import ChartPanel, { type ChartRange } from "@/components/ChartPanel";
import SearchBar from "@/pages/Stocks/components/SearchBar";
import StocksList, {
  type StockItem,
  type StockSort,
} from "@/pages/Stocks/components/StocksList";
import StocksTab, { type StockTab } from "@/pages/Stocks/components/StocksTab";
import holdingsResponse from "@/pages/Stocks/mock/holdings.json";
import stocksResponse from "@/pages/Stocks/mock/stocks.json";
import chartResponse from "@/pages/Stocks/mock/chart.json";

type StocksApiResponse = {
  date: string;
  market: string;
  sort_by: string;
  order: string;
  count: number;
  stocks: StockItem[];
};

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

type ChartApiResponse = {
  symbol: string;
  range: ChartRange;
  type: string;
  plotly: string | object;
  meta: {
    ma: number[];
    generatedAt: string;
  };
};

const STOCKS_RESPONSE = stocksResponse as StocksApiResponse;
const HOLDINGS_RESPONSE = holdingsResponse as HoldingsApiResponse;
const CHART_RESPONSE = chartResponse as ChartApiResponse;

const STOCKS = STOCKS_RESPONSE.stocks;
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
  const [selectedStock, setSelectedStock] = useState<StockItem>(STOCKS[0]);
  const [range, setRange] = useState<ChartRange>("1d");
  const [sortBy, setSortBy] = useState<StockSort>("price");

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
      setSortBy("price");
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

    return STOCKS;
  }, [activeTab]);

  const sortedStocks = useMemo(() => {
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
  }, [displayedStocks, sortBy]);

  const effectiveSelectedStock = selectedStock ?? sortedStocks[0];

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
            selectedId={effectiveSelectedStock.ticker}
            onSelect={(item) => setSelectedStock(item)}
            sortBy={sortBy}
            onSortChange={setSortBy}
            sortOptions={
              activeTab === "holding"
                ? HOLDING_SORT_OPTIONS
                : STOCK_SORT_OPTIONS
            }
            metaLabel={activeTab === "holding" ? "보유량" : "거래량"}
          />
        </div>
      </section>

      <ChartPanel
        symbol={`${effectiveSelectedStock.name} (${effectiveSelectedStock.ticker})`}
        range={range}
        onRangeChange={setRange}
        loading={false}
        error={null}
        plotlyJson={CHART_RESPONSE.plotly}
      />
    </div>
  );
}
