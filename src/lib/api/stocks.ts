import { api } from "@/lib/api/axios";
import type { StockItem } from "@/pages/Stocks/components/StocksList";

export type StocksMarket = "ALL" | "KOSPI" | "KOSDAQ";
export type StocksSort = "change_rate" | "price" | "volume";
export type StocksOrder = "desc" | "asc";

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
