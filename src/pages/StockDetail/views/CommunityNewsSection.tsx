import {
	type InfiniteData,
	useInfiniteQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
	fetchStockCommunity,
	fetchStockCommunityLatest,
	fetchStockNews,
} from "@/lib/api/stocks/communityNews";
import type { StockCommunityResponse } from "@/types/stockCommunityNews";

const COMMUNITY_LATEST_POLL_INTERVAL_MS = 10_000;
type CommunityNewsTab = "community" | "news";

type CommunityNewsSectionProps = {
	symbol?: string;
	activeTab?: CommunityNewsTab;
	showContainer?: boolean;
	showHeader?: boolean;
};

export default function CommunityNewsSection({
	symbol,
	activeTab: controlledTab,
	showContainer = true,
	showHeader = true,
}: CommunityNewsSectionProps) {
	const queryClient = useQueryClient();
	const [internalTab, setInternalTab] = useState<CommunityNewsTab>(
		controlledTab ?? "community",
	);
	const scrollContainerRef = useRef<HTMLDivElement | null>(null);
	const scrollPositionsRef = useRef({ community: 0, news: 0 });
	const communityFirstPageRef = useRef<StockCommunityResponse | null>(null);
	const activeTab = controlledTab ?? internalTab;

	useEffect(() => {
		if (controlledTab) {
			setInternalTab(controlledTab);
		}
	}, [controlledTab]);

	const {
		data: communityData,
		isLoading: communityLoading,
		isError: isCommunityError,
		error: communityError,
		hasNextPage: hasNextCommunityPage,
		isFetchingNextPage: isFetchingNextCommunityPage,
		fetchNextPage: fetchNextCommunityPage,
	} = useInfiniteQuery({
		queryKey: ["stock-community", symbol],
		enabled: activeTab === "community" && Boolean(symbol),
		initialPageParam: undefined as string | undefined,
		queryFn: ({ pageParam }) =>
			fetchStockCommunity(symbol as string, { cursor: pageParam, limit: 20 }),
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

	const {
		data: newsData,
		isLoading: newsLoading,
		isError: isNewsError,
		error: newsError,
		hasNextPage: hasNextNewsPage,
		isFetchingNextPage: isFetchingNextNewsPage,
		fetchNextPage: fetchNextNewsPage,
	} = useInfiniteQuery({
		queryKey: ["stock-news", symbol],
		enabled: activeTab === "news" && Boolean(symbol),
		initialPageParam: undefined as string | undefined,
		queryFn: ({ pageParam }) =>
			fetchStockNews(symbol as string, { cursor: pageParam, limit: 20 }),
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

	const communityPages = communityData?.pages ?? [];
	const communityFirstPage = communityPages[0] ?? null;
	const communityLastPage = communityPages[communityPages.length - 1] ?? null;
	const communityItems = useMemo(() => {
		const seen = new Set<string>();
		return communityPages.flatMap((page) =>
			page.items.filter((item) => {
				if (seen.has(item.id)) {
					return false;
				}
				seen.add(item.id);
				return true;
			}),
		);
	}, [communityPages]);

	const newsPages = newsData?.pages ?? [];
	const newsFirstPage = newsPages[0] ?? null;
	const newsLastPage = newsPages[newsPages.length - 1] ?? null;
	const newsItems = useMemo(() => {
		const seen = new Set<string>();
		return newsPages.flatMap((page) =>
			page.items.filter((item) => {
				if (seen.has(item.id)) {
					return false;
				}
				seen.add(item.id);
				return true;
			}),
		);
	}, [newsPages]);

	const communityErrorMessage =
		communityError instanceof Error
			? communityError.message
			: "커뮤니티를 불러오는 중 오류가 발생했습니다.";

	const newsErrorMessage =
		newsError instanceof Error
			? newsError.message
			: "뉴스를 불러오는 중 오류가 발생했습니다.";

	const latestCommunitySince = useMemo(() => {
		if (communityItems.length === 0) {
			return communityFirstPage?.fetched_at ?? null;
		}

		return communityItems.reduce((latest, item) => {
			if (!latest || item.published_at > latest) {
				return item.published_at;
			}
			return latest;
		}, "" as string);
	}, [communityItems, communityFirstPage]);

	useEffect(() => {
		communityFirstPageRef.current = communityFirstPage;
	}, [communityFirstPage]);

	useEffect(() => {
		if (
			activeTab !== "community" ||
			!symbol ||
			!latestCommunitySince ||
			!communityFirstPageRef.current
		) {
			return;
		}

		const pollLatest = async () => {
			const latestResponse = await fetchStockCommunityLatest(symbol, {
				since: latestCommunitySince,
			});

			if (latestResponse.items.length === 0) {
				return;
			}

			queryClient.setQueryData<InfiniteData<StockCommunityResponse>>(
				["stock-community", symbol],
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
	}, [
		activeTab,
		symbol,
		latestCommunitySince,
		queryClient,
	]);

	useEffect(() => {
		const container = scrollContainerRef.current;
		if (!container) {
			return;
		}

		const target = scrollPositionsRef.current[activeTab];
		requestAnimationFrame(() => {
			container.scrollTop = target;
		});
	}, [activeTab]);

	const handleTabChange = (nextTab: CommunityNewsTab) => {
		if (nextTab === activeTab) {
			return;
		}
		const container = scrollContainerRef.current;
		if (container) {
			scrollPositionsRef.current[activeTab] = container.scrollTop;
		}
		setInternalTab(nextTab);
	};

	const handleScroll = (element: HTMLDivElement) => {
		scrollPositionsRef.current[activeTab] = element.scrollTop;

		if (
			activeTab === "community" &&
			hasNextCommunityPage &&
			!isFetchingNextCommunityPage &&
			element.scrollHeight - element.scrollTop - element.clientHeight < 40
		) {
			void fetchNextCommunityPage();
		}

		if (
			activeTab === "news" &&
			hasNextNewsPage &&
			!isFetchingNextNewsPage &&
			element.scrollHeight - element.scrollTop - element.clientHeight < 40
		) {
			void fetchNextNewsPage();
		}
	};

	const content = (
		<>
			{showHeader && (
				<div className="flex flex-wrap items-center justify-between gap-4">
					<h3 className="text-lg font-semibold text-slate-900">
						커뮤니티 / 뉴스
					</h3>
					<div className="flex items-center gap-2 rounded-full bg-slate-100 p-1">
						<button
							type="button"
							onClick={() => handleTabChange("community")}
							className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
								activeTab === "community"
									? "bg-white text-slate-900 shadow-sm"
									: "text-slate-500 hover:text-slate-700"
							}`}
						>
							커뮤니티
						</button>
						<button
							type="button"
							onClick={() => handleTabChange("news")}
							className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
								activeTab === "news"
									? "bg-white text-slate-900 shadow-sm"
									: "text-slate-500 hover:text-slate-700"
							}`}
						>
							뉴스
						</button>
					</div>
				</div>
			)}

			{activeTab === "community" && (
				<div className={`${showHeader ? "mt-6 " : ""}space-y-4`}>
					{communityLoading && (
						<div className="flex justify-center py-4">
							<LoadingSpinner label="커뮤니티 불러오는 중..." />
						</div>
					)}
					{isCommunityError && (
						<div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
							{communityErrorMessage}
						</div>
					)}
					{communityFirstPage?.ai_summary && (
						<article className="rounded-2xl border border-slate-200 bg-white p-4">
							<div className="text-xs font-semibold text-slate-500">
								AI 요약
							</div>
							<p className="mt-2 text-sm text-slate-800">
								{communityFirstPage.ai_summary}
							</p>
						</article>
					)}
					<div
						ref={scrollContainerRef}
						onScroll={(event) => handleScroll(event.currentTarget)}
						className="max-h-80 space-y-3 overflow-y-auto pr-1"
					>
						{communityItems.map((item) => (
							<article
								key={item.id}
								className="rounded-2xl border border-slate-200 bg-white p-4"
							>
								<div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
									<span>{item.source}</span>
									<span>·</span>
									<span>{item.published_at}</span>
									<span>·</span>
									<span className="font-semibold text-slate-600">
										{item.sentiment.toUpperCase()}
									</span>
								</div>
								<h4 className="mt-2 text-sm font-semibold text-slate-900">
									{item.title}
								</h4>
								<p className="mt-2 text-sm text-slate-600 line-clamp-2">
									{item.content}
								</p>
								<a
									href={item.url}
									target="_blank"
									rel="noreferrer"
									className="mt-3 inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:border-slate-300 hover:text-slate-800"
								>
									원문 보기
								</a>
							</article>
						))}
						{isFetchingNextCommunityPage && (
							<div className="flex justify-center py-2">
								<LoadingSpinner label="커뮤니티 더 불러오는 중..." size="sm" />
							</div>
						)}
						{!communityLoading &&
							!isCommunityError &&
							communityItems.length === 0 && (
								<div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
									표시할 커뮤니티 글이 없습니다.
								</div>
							)}
					</div>
					{(communityFirstPage || communityLastPage) && (
						<div className="text-xs text-slate-400">
							{(communityFirstPage ?? communityLastPage)?.company_name} ·{" "}
							{(communityFirstPage ?? communityLastPage)?.symbol} ·{" "}
							{(communityFirstPage ?? communityLastPage)?.fetched_at}
						</div>
					)}
				</div>
			)}

			{activeTab === "news" && (
				<div className={`${showHeader ? "mt-6 " : ""}space-y-4`}>
					{newsLoading && (
						<div className="flex justify-center py-4">
							<LoadingSpinner label="뉴스 불러오는 중..." />
						</div>
					)}
					{isNewsError && (
						<div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
							{newsErrorMessage}
						</div>
					)}
					<div
						ref={scrollContainerRef}
						onScroll={(event) => handleScroll(event.currentTarget)}
						className="max-h-80 space-y-3 overflow-y-auto pr-1"
					>
						{newsItems.map((item) => (
							<article
								key={item.id}
								className="rounded-2xl border border-slate-200 bg-white p-4"
							>
								<div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
									<span>{item.source}</span>
									<span>·</span>
									<span>{item.published_at}</span>
									<span>·</span>
									<span className="font-semibold text-slate-600">
										{item.is_investment_related ? "투자관련" : "기타"}
									</span>
								</div>
								<h4 className="mt-2 text-sm font-semibold text-slate-900">
									{item.title}
								</h4>
								<p className="mt-2 text-sm text-slate-600 line-clamp-2">
									{item.content}
								</p>
								<a
									href={item.url}
									target="_blank"
									rel="noreferrer"
									className="mt-3 inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:border-slate-300 hover:text-slate-800"
								>
									원문 보기
								</a>
							</article>
						))}
						{isFetchingNextNewsPage && (
							<div className="flex justify-center py-2">
								<LoadingSpinner label="뉴스 더 불러오는 중..." size="sm" />
							</div>
						)}
						{!newsLoading && !isNewsError && newsItems.length === 0 && (
							<div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
								표시할 뉴스가 없습니다.
							</div>
						)}
					</div>
					{(newsFirstPage || newsLastPage) && (
						<div className="text-xs text-slate-400">
							{(newsFirstPage ?? newsLastPage)?.company_name} ·{" "}
							{(newsFirstPage ?? newsLastPage)?.symbol} ·{" "}
							{(newsFirstPage ?? newsLastPage)?.fetched_at}
						</div>
					)}
				</div>
			)}
		</>
	);

	if (!showContainer) {
		return content;
	}

	return (
		<section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_40px_-32px_rgba(15,23,42,0.6)]">
			{content}
		</section>
	);
}
