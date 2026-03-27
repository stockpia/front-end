import { useEffect, useRef, useState } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  useStockCommunityInfiniteQuery,
  useStockCommunityLatestPolling,
  useStockNewsInfiniteQuery,
} from "@/hooks/queries/useStockCommunityNewsQueries";
import type { StockCommunitySentiment } from "@/types/stockCommunityNews";
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
  const [internalTab, setInternalTab] = useState<CommunityNewsTab>(
    controlledTab ?? "community",
  );
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const scrollPositionsRef = useRef({ community: 0, news: 0 });
  const activeTab = controlledTab ?? internalTab;
  const getSentimentClassName = (sentiment: StockCommunitySentiment) => {
    if (sentiment === "positive") {
      return "text-emerald-600";
    }
    if (sentiment === "negative") {
      return "text-rose-500";
    }
    return "text-amber-500";
  };

  useEffect(() => {
    if (controlledTab) {
      setInternalTab(controlledTab);
    }
  }, [controlledTab]);

  const communityQuery = useStockCommunityInfiniteQuery({
    symbol,
    enabled: activeTab === "community",
  });
  const newsQuery = useStockNewsInfiniteQuery({
    symbol,
    enabled: activeTab === "news",
  });

  const {
    items: communityItems,
    firstPage: communityFirstPage,
    lastPage: communityLastPage,
    isLoading: communityLoading,
    isError: isCommunityError,
    errorMessage: communityErrorMessage,
    hasNextPage: hasNextCommunityPage,
    isFetchingNextPage: isFetchingNextCommunityPage,
    fetchNextPage: fetchNextCommunityPage,
    latestSince: latestCommunitySince,
  } = communityQuery;
  const {
    items: newsItems,
    firstPage: newsFirstPage,
    lastPage: newsLastPage,
    isLoading: newsLoading,
    isError: isNewsError,
    errorMessage: newsErrorMessage,
    hasNextPage: hasNextNewsPage,
    isFetchingNextPage: isFetchingNextNewsPage,
    fetchNextPage: fetchNextNewsPage,
  } = newsQuery;

  useStockCommunityLatestPolling({
    symbol,
    since: latestCommunitySince,
    enabled: activeTab === "community",
    hasSeedPage: Boolean(communityFirstPage),
  });

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
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <span className="font-semibold text-emerald-600">POSITIVE</span>,{" "}
            <span className="font-semibold text-amber-500">NEUTRAL</span>,{" "}
            <span className="font-semibold text-rose-500">NEGATIVE</span>는
            커뮤니티 내용의 긍정, 중립, 부정을 의미해요 !
          </div>
          {communityFirstPage?.ai_summary && (
            <article className="rounded-2xl border border-slate-200 bg-slate-100 p-4">
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
            className="max-h-80 space-y-3 overflow-y-auto pr-1">
            {communityItems.map((item) => (
              <article
                key={`${item.url}-${item.published_at}-${item.id}`}
                className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span>{item.published_at}</span>
                  <span>·</span>
                  <span
                    className={`font-semibold ${getSentimentClassName(
                      item.sentiment,
                    )}`}>
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
                  className="mt-3 inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:border-slate-300 hover:text-slate-800">
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
            className="max-h-80 space-y-3 overflow-y-auto pr-1">
            {newsItems.map((item) => (
              <article
                key={`${item.url}-${item.published_at}-${item.id}`}
                className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span>{item.source}</span>
                  <span>·</span>
                  <span>{item.published_at}</span>
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
