import { useQuery } from "@tanstack/react-query";
import {
	fetchHoldings,
	fetchStocksList,
	fetchStockWatchlist,
	type HoldingsSort,
} from "@/lib/api/stocks/list";
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

type UseStockWatchlistQueryParams = {
	userId: string;
	enabled?: boolean;
};

export function useStockWatchlistQuery({
	userId,
	enabled = true,
}: UseStockWatchlistQueryParams) {
	const query = useQuery({
		queryKey: ["stock-watchlist", userId],
		enabled,
		queryFn: ({ signal }) => fetchStockWatchlist(userId, signal),
	});

	return {
		...query,
		errorMessage: toErrorMessage(query.error),
		stocks: query.data?.stocks ?? [],
	};
}

type UseHoldingsQueryParams = {
	sort?: HoldingsSort;
	order?: StocksOrder;
	enabled?: boolean;
};

export function useHoldingsQuery({
	sort = "eval_amount",
	order = "desc",
	enabled = true,
}: UseHoldingsQueryParams) {
	const query = useQuery({
		queryKey: ["stock-holdings", sort, order],
		enabled,
		queryFn: ({ signal }) =>
			fetchHoldings(
				{
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
