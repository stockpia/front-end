import { api } from "@/lib/api/axios";
import type {
	StocksListParams,
	StocksListResponse,
	StocksOrder,
	StockWatchlistResponse,
} from "@/types/stocks";

export type HoldingsSort = "eval_amount" | "profit_rate" | "name";

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
	const { data } = await api.get<StocksListResponse>("/web/stocks/list", {
		params,
		signal,
	});
	return data;
}

export async function fetchStockWatchlist(
	userId: string,
	signal?: AbortSignal,
) {
	const { data } = await api.get<StockWatchlistResponse>(
		"/web/stocks/watchlist",
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
	const { data } = await api.get<HoldingsResponse>("/web/stocks/holdings", {
		params,
		signal,
	});
	return data;
}
