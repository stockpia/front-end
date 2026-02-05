import { api } from "@/lib/api/axios";
import type { StockItem } from "@/pages/Stocks/components/StocksList";

export type StocksMarket = "ALL" | "KOSPI" | "KOSDAQ";
export type StocksSort = "change_rate" | "price" | "volume";
export type StocksOrder = "desc" | "asc";
export type StockChartRange = "1d" | "1m" | "3m" | "1y";
export type StockChartType = "candlestick" | "technical" | "line" | "volume";
export type HoldingsSort = "eval_amount" | "profit_rate" | "name";

export type StocksListParams = {
  market?: StocksMarket;
  sort?: StocksSort;
  order?: StocksOrder;
};

export type StocksListResponse = {
  market: string;
  sort_by: string;
  order: string;
  count: number;
  stocks: StockItem[];
};

export type StockChartResponse = {
  symbol: string;
  range: StockChartRange;
  type: StockChartType;
  plotly: unknown;
  meta?: {
    ma?: number[];
    generatedAt?: string;
  };
};

export type StockWatchlistResponse = {
	user_id: string;
	count: number;
	stocks: StockItem[];
};

export type HoldingsStock = {
	ticker: string;
	name: string;
	quantity: number;
	avg_price: number;
	current_price: number;
	eval_amount: number;
	profit_amount: number;
	profit_rate: number;
};

export type HoldingsResponse = {
	count: number;
	total_eval_amount: number;
	total_profit_amount: number;
	sort_by: HoldingsSort;
	order: StocksOrder;
	stocks: HoldingsStock[];
};

export async function fetchStocksList(
  params: StocksListParams,
  signal?: AbortSignal,
) {
  const { data } = await api.get<StocksListResponse>("/api/web/stocks/list", {
    params,
    signal,
  });
  return data;
}

export async function fetchStockChart(
  symbol: string,
  params: { range: StockChartRange; type: StockChartType },
  signal?: AbortSignal,
) {
  const { data } = await api.get<StockChartResponse>(
    `/api/web/stocks/${symbol}/chart`,
    {
      params,
      signal,
    },
  );
  return data;
}

export async function fetchStockWatchlist(
	userId: string,
	signal?: AbortSignal,
) {
  const { data } = await api.get<StockWatchlistResponse>(
    "/api/web/stocks/watchlist",
    {
      params: { user_id: userId },
      signal,
    },
  );
	return data;
}

export async function fetchHoldings(
	params: { sort?: HoldingsSort; order?: StocksOrder },
	signal?: AbortSignal,
) {
	const { data } = await api.get<HoldingsResponse>("/api/web/stocks/holdings", {
		params,
		signal,
	});
	return data;
}
