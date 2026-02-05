import { api } from "@/lib/api/axios";
import type { StockItem } from "@/pages/Stocks/components/StocksList";

export type StocksMarket = "ALL" | "KOSPI" | "KOSDAQ";
export type StocksSort = "change_rate" | "price" | "volume";
export type StocksOrder = "desc" | "asc";
export type StockChartRange = "1d" | "1m" | "3m" | "1y";
export type StockChartType =
	| "candlestick"
	| "technical"
	| "line"
	| "volume"
	| "compare"
	| "index";

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
