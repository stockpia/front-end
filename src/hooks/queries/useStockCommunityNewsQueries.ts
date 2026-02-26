import { type InfiniteData, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import {
	fetchStockCommunity,
	fetchStockCommunityLatest,
	fetchStockNews,
} from "@/lib/api/stocks/communityNews";
import type {
	StockCommunityResponse,
	StockNewsResponse,
} from "@/types/stockCommunityNews";

const DEFAULT_LIMIT = 20;
const COMMUNITY_LATEST_POLL_INTERVAL_MS = 10_000;

function toErrorMessage(error: unknown, fallback: string) {
	if (error instanceof Error) {
		return error.message;
	}
	return fallback;
}

export function stockCommunityQueryKey(symbol?: string) {
	return ["stock-community", symbol ?? null] as const;
}

export function stockNewsQueryKey(symbol?: string) {
	return ["stock-news", symbol ?? null] as const;
}

type UseStockCommunityInfiniteQueryParams = {
	symbol?: string;
	enabled?: boolean;
};

export function useStockCommunityInfiniteQuery({
	symbol,
	enabled = true,
}: UseStockCommunityInfiniteQueryParams) {
	const query = useInfiniteQuery({
		queryKey: stockCommunityQueryKey(symbol),
		enabled: Boolean(symbol) && enabled,
		initialPageParam: undefined as string | undefined,
		queryFn: ({ pageParam }) =>
			fetchStockCommunity(symbol as string, { cursor: pageParam, limit: DEFAULT_LIMIT }),
		getNextPageParam: (lastPage) => {
			if (!lastPage.has_more) {
				return undefined;
			}
			if (lastPage.next_cursor) {
				return lastPage.next_cursor;
			}
			return lastPage.items[lastPage.items.length - 1]?.id;
		},
	});

	const pages = query.data?.pages ?? [];
	const firstPage = pages[0] ?? null;
	const lastPage = pages[pages.length - 1] ?? null;
	const items = useMemo(() => {
		const seen = new Set<string>();
		return pages.flatMap((page) =>
			page.items.filter((item) => {
				if (seen.has(item.id)) {
					return false;
				}
				seen.add(item.id);
				return true;
			}),
		);
	}, [pages]);

	const latestSince = useMemo(() => {
		if (items.length === 0) {
			return firstPage?.fetched_at ?? null;
		}
		return items.reduce((latest, item) => {
			if (!latest || item.published_at > latest) {
				return item.published_at;
			}
			return latest;
		}, "" as string);
	}, [items, firstPage]);

	return {
		...query,
		pages,
		firstPage,
		lastPage,
		items,
		latestSince,
		errorMessage: toErrorMessage(
			query.error,
			"커뮤니티를 불러오는 중 오류가 발생했습니다.",
		),
	};
}

type UseStockNewsInfiniteQueryParams = {
	symbol?: string;
	enabled?: boolean;
};

export function useStockNewsInfiniteQuery({
	symbol,
	enabled = true,
}: UseStockNewsInfiniteQueryParams) {
	const query = useInfiniteQuery({
		queryKey: stockNewsQueryKey(symbol),
		enabled: Boolean(symbol) && enabled,
		initialPageParam: undefined as string | undefined,
		queryFn: ({ pageParam }) =>
			fetchStockNews(symbol as string, { cursor: pageParam, limit: DEFAULT_LIMIT }),
		getNextPageParam: (lastPage) => {
			if (!lastPage.has_more) {
				return undefined;
			}
			if (lastPage.next_cursor) {
				return lastPage.next_cursor;
			}
			return lastPage.items[lastPage.items.length - 1]?.id;
		},
	});

	const pages = query.data?.pages ?? [];
	const firstPage = pages[0] ?? null;
	const lastPage = pages[pages.length - 1] ?? null;
	const items = useMemo(() => {
		const seen = new Set<string>();
		return pages.flatMap((page) =>
			page.items.filter((item) => {
				if (seen.has(item.id)) {
					return false;
				}
				seen.add(item.id);
				return true;
			}),
		);
	}, [pages]);

	return {
		...query,
		pages,
		firstPage,
		lastPage,
		items,
		errorMessage: toErrorMessage(query.error, "뉴스를 불러오는 중 오류가 발생했습니다."),
	};
}

type UseStockCommunityLatestPollingParams = {
	symbol?: string;
	since?: string | null;
	enabled?: boolean;
	hasSeedPage?: boolean;
};

export function useStockCommunityLatestPolling({
	symbol,
	since,
	enabled = true,
	hasSeedPage = false,
}: UseStockCommunityLatestPollingParams) {
	const queryClient = useQueryClient();

	useEffect(() => {
		if (!enabled || !symbol || !since || !hasSeedPage) {
			return;
		}

		const pollLatest = async () => {
			const latestResponse = await fetchStockCommunityLatest(symbol, { since });
			if (latestResponse.items.length === 0) {
				return;
			}

			queryClient.setQueryData<InfiniteData<StockCommunityResponse>>(
				stockCommunityQueryKey(symbol),
				(prev) => {
					if (!prev || prev.pages.length === 0) {
						return prev;
					}

					const existingIds = new Set(
						prev.pages.flatMap((page) => page.items.map((item) => item.id)),
					);
					const incomingItems = latestResponse.items.filter(
						(item) => !existingIds.has(item.id),
					);
					if (incomingItems.length === 0) {
						return prev;
					}

					const firstPage = prev.pages[0];
					const nextFirstPage: StockCommunityResponse = {
						...firstPage,
						items: [...incomingItems, ...firstPage.items],
						total_count: firstPage.total_count + incomingItems.length,
						new_count:
							typeof latestResponse.new_count === "number"
								? latestResponse.new_count
								: firstPage.new_count + incomingItems.length,
						fetched_at: latestResponse.fetched_at || firstPage.fetched_at,
					};

					return {
						...prev,
						pages: [nextFirstPage, ...prev.pages.slice(1)],
					};
				},
			);
		};

		void pollLatest().catch(() => {
			// Ignore polling errors and continue with the next interval.
		});

		const intervalId = window.setInterval(() => {
			void pollLatest().catch(() => {
				// Ignore polling errors and continue with the next interval.
			});
		}, COMMUNITY_LATEST_POLL_INTERVAL_MS);

		return () => {
			window.clearInterval(intervalId);
		};
	}, [enabled, hasSeedPage, queryClient, since, symbol]);
}

export type { StockCommunityResponse, StockNewsResponse };
