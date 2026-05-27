import { api } from "@/lib/api/axios";

export type StockSearchItem = {
	ticker: string;
	name: string;
};

export type StockSearchResponse = {
	query: string;
	count: number;
	stocks: StockSearchItem[];
};

export async function fetchStocksSearch(
	query: string,
	limit = 20,
	signal?: AbortSignal,
) {
	const { data } = await api.get<StockSearchResponse>("/web/stocks/search", {
		params: { q: query, limit },
		signal,
	});
	return data;
}
