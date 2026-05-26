import { useQuery } from "@tanstack/react-query";
import {
	fetchHoldings,
	fetchStocksList,
	type HoldingsSort,
} from "@/lib/api/stocks/list";
import { fetchStockOrderBook as fetchStockOrderBookApi } from "@/lib/api/stocks/orderbook";
import type { StocksMarket, StocksOrder, StocksSort } from "@/types/stocks";

function toErrorMessage(error: unknown) {
	if (error instanceof Error) {
		return error.message;
	}
	return error ? "알 수 없는 오류가 발생했습니다." : null;
}

type UseStocksListQueryParams = {
	market?: StocksMarket;
	sort?: StocksSort;
	order?: StocksOrder;
	enabled?: boolean;
};

export function useStocksListQuery({
	market = "ALL",
	sort = "change_rate",
	order = "desc",
	enabled = true,
}: UseStocksListQueryParams) {
	const query = useQuery({
		queryKey: ["stocks-list", market, sort, order],
		enabled,
		queryFn: ({ signal }) =>
			fetchStocksList(
				{
					market,
					sort,
					order,
				},
				signal,
			),
	});

	return {
		...query,
		errorMessage: toErrorMessage(query.error),
		stocks: query.data?.stocks ?? [],
	};
}

type UseHoldingsQueryParams = {
	userId?: string;
	sort?: HoldingsSort;
	order?: StocksOrder;
	enabled?: boolean;
};

export function useHoldingsQuery({
	userId,
	sort = "eval_amount",
	order = "desc",
	enabled = true,
}: UseHoldingsQueryParams) {
	const query = useQuery({
		queryKey: ["stock-holdings", userId, sort, order],
		enabled,
		queryFn: ({ signal }) =>
			fetchHoldings(
				{
					user_id: userId,
					sort,
					order,
				},
				signal,
			),
	});

	return {
		...query,
		errorMessage: toErrorMessage(query.error),
		holdings: query.data?.stocks ?? [],
	};
}

type UseStockOrderBookQueryParams = {
	ticker?: string;
	enabled?: boolean;
};

export function useStockOrderBookQuery({
	ticker,
	enabled = true,
}: UseStockOrderBookQueryParams) {
	const query = useQuery({
		queryKey: ["stock-orderbook", ticker ?? null],
		enabled: Boolean(ticker) && enabled,
		queryFn: ({ signal }) => fetchStockOrderBookApi(ticker as string, signal),
		refetchInterval: 5000,
	});

	return {
		...query,
		errorMessage: toErrorMessage(query.error),
		orderBook: query.data ?? null,
	};
}
