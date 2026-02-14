import { useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import LoadingSpinner from "@/components/LoadingSpinner";
import { fetchStockNews } from "@/lib/api/stocks";
import { stockCommunityMock } from "@/mocks/stockDetail";

type CommunityNewsSectionProps = {
  symbol?: string;
};

export default function CommunityNewsSection({ symbol }: CommunityNewsSectionProps) {
  const [activeTab, setActiveTab] = useState<"community" | "news">("community");
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const scrollPositionsRef = useRef({ community: 0, news: 0 });

  const communitySummary = stockCommunityMock;

  const {
    data: newsData,
    isLoading: newsLoading,
    isError: isNewsError,
    error: newsError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
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

      const fallbackCursor = lastPage.items[lastPage.items.length - 1]?.id;
      return fallbackCursor;
    },
  });

  const newsPages = newsData?.pages ?? [];
  const newsSummary = newsPages[newsPages.length - 1] ?? null;
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

  const newsErrorMessage =
    newsError instanceof Error
      ? newsError.message
      : "뉴스를 불러오는 중 오류가 발생했습니다.";

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

  const handleTabChange = (nextTab: "community" | "news") => {
    if (nextTab === activeTab) {
      return;
    }
    const container = scrollContainerRef.current;
    if (container) {
      scrollPositionsRef.current[activeTab] = container.scrollTop;
    }
    setActiveTab(nextTab);
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_40px_-32px_rgba(15,23,42,0.6)]">
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
            }`}>
            커뮤니티
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("news")}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              activeTab === "news"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}>
            뉴스
          </button>
        </div>
      </div>

      {activeTab === "community" && (
        <div className="mt-6 space-y-4">
          {communitySummary.ai_summary && (
            <article className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-semibold text-slate-500">
                AI 요약
              </div>
              <p className="mt-2 text-sm text-slate-800">
                {communitySummary.ai_summary}
              </p>
            </article>
          )}
          <div
            ref={scrollContainerRef}
            onScroll={(event) => {
              const element = event.currentTarget;
              scrollPositionsRef.current[activeTab] = element.scrollTop;
            }}
            className="max-h-80 space-y-3 overflow-y-auto pr-1">
            {communitySummary.items.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl border border-slate-200 bg-white p-4">
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
                <button
                  type="button"
                  className="mt-3 inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:border-slate-300 hover:text-slate-800">
                  원문 보기
                </button>
              </article>
            ))}
          </div>
          <div className="text-xs text-slate-400">
            {communitySummary.company_name} · {communitySummary.symbol} ·{" "}
            {communitySummary.fetched_at}
          </div>
        </div>
      )}

      {activeTab === "news" && (
        <div className="mt-6 space-y-4">
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
            onScroll={(event) => {
              const element = event.currentTarget;
              scrollPositionsRef.current[activeTab] = element.scrollTop;

              if (
                hasNextPage &&
                !isFetchingNextPage &&
                element.scrollHeight - element.scrollTop - element.clientHeight < 40
              ) {
                void fetchNextPage();
              }
            }}
            className="max-h-80 space-y-3 overflow-y-auto pr-1">
            {newsItems.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl border border-slate-200 bg-white p-4">
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
                  className="mt-3 inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:border-slate-300 hover:text-slate-800">
                  원문 보기
                </a>
              </article>
            ))}
            {isFetchingNextPage && (
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
          {newsSummary && (
            <div className="text-xs text-slate-400">
              {newsSummary.company_name} · {newsSummary.symbol} ·{" "}
              {newsSummary.fetched_at}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
