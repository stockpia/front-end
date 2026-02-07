import { useEffect, useRef, useState } from "react";
import { stockCommunityMock, stockNewsMock } from "@/mocks/stockDetail";

export default function CommunityNewsSection() {
  const [activeTab, setActiveTab] = useState<"community" | "news">("community");
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const scrollPositionsRef = useRef({ community: 0, news: 0 });

  const communitySummary = stockCommunityMock;
  const newsSummary = stockNewsMock;

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
          <div
            ref={scrollContainerRef}
            onScroll={(event) => {
              const element = event.currentTarget;
              scrollPositionsRef.current[activeTab] = element.scrollTop;
            }}
            className="max-h-80 space-y-3 overflow-y-auto pr-1">
            {newsSummary.items.map((item) => (
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
                <button
                  type="button"
                  className="mt-3 inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:border-slate-300 hover:text-slate-800">
                  원문 보기
                </button>
              </article>
            ))}
          </div>
          <div className="text-xs text-slate-400">
            {newsSummary.company_name} · {newsSummary.symbol} ·{" "}
            {newsSummary.fetched_at}
          </div>
        </div>
      )}
    </section>
  );
}
