import { useState } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import type { StockReportResponse } from "@/types/stockCommunityNews";

type StockReportSectionProps = {
  isLoading: boolean;
  isError: boolean;
  errorMessage: string;
  report: StockReportResponse | null;
};

export default function StockReportSection({
  isLoading,
  isError,
  errorMessage,
  report,
}: StockReportSectionProps) {
  const [openSections, setOpenSections] = useState({
    keyPoints: false,
    valuation: false,
    opinion: true,  // 투자 의견 default 펼침 — 보조 정보 (체크포인트/관점) 포함해서 핵심 콘텐츠
  });

  const formatNumber = (value?: number) => {
    if (typeof value !== "number") {
      return "-";
    }
    return value.toLocaleString("ko-KR");
  };

  const formatMetric = (value?: number) => {
    if (typeof value !== "number" || value <= 0) {
      return "N/A";
    }
    return value.toLocaleString("ko-KR");
  };

  const formatGeneratedAt = (value?: string) => {
    if (!value) {
      return "-";
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  return (
    <div className="mt-6 space-y-4">
      {isLoading && (
        <div className="flex justify-center py-4">
          <LoadingSpinner label="종목 리포트를 불러오는 중..." />
        </div>
      )}
      {isError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {errorMessage}
        </div>
      )}
      {!isLoading && !isError && !report && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
          종목 리포트 데이터가 없습니다.
        </div>
      )}

      {report && (
        <>
          <article className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span>{report.company_name}</span>
              <span>·</span>
              <span>{report.symbol}</span>
              <span>·</span>
              <span>{formatGeneratedAt(report.generated_at)}</span>
            </div>
            <h4 className="mt-3 text-base font-semibold text-slate-900">
              투자 요약
            </h4>
            <p className="mt-2 text-sm leading-7 text-slate-700">
              {report.summary.investment_summary}
            </p>
            <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
              <div className="rounded-xl bg-slate-100 px-3 py-2">
                <div className="text-xs text-slate-500">현재가</div>
                <div className="font-semibold text-slate-900 break-keep">
                  {formatNumber(report.summary.current_price)}
                </div>
              </div>
              <div className="rounded-xl bg-slate-100 px-3 py-2">
                <div className="text-xs text-slate-500">변동률</div>
                <div className="font-semibold text-slate-900 break-keep">
                  {report.summary.price_change_pct}%
                </div>
              </div>
              <div className="rounded-xl bg-slate-100 px-3 py-2">
                <div className="text-xs text-slate-500">1년 수익률</div>
                <div className="font-semibold text-slate-900 break-keep">
                  {report.summary.return_1y}%
                </div>
              </div>
              <div className="col-span-3 rounded-xl bg-slate-100 px-3 py-2">
                <div className="text-xs text-slate-500">RSI</div>
                <div className="font-semibold text-slate-900 break-keep">
                  {report.summary.rsi}
                </div>
              </div>
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5">
            <button
              type="button"
              onClick={() =>
                setOpenSections((prev) => ({
                  ...prev,
                  keyPoints: !prev.keyPoints,
                }))
              }
              className="flex w-full items-center justify-between text-left">
              <h4 className="text-sm font-semibold text-slate-900">
                핵심 포인트
              </h4>
              <span className="text-xs font-semibold text-slate-500">
                {openSections.keyPoints ? "접기" : "펼치기"}
              </span>
            </button>
            {openSections.keyPoints && (
              <>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-slate-700">
                  {report.sections.investment_summary.key_points.map(
                    (point) => (
                      <li key={point}>{point}</li>
                    ),
                  )}
                </ul>
                <p className="mt-4 rounded-xl bg-slate-100 px-3 py-2 text-sm leading-7 text-slate-700">
                  체크포인트: {report.sections.investment_summary.checkpoint}
                </p>
              </>
            )}
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5">
            <button
              type="button"
              onClick={() =>
                setOpenSections((prev) => ({
                  ...prev,
                  valuation: !prev.valuation,
                }))
              }
              className="flex w-full items-center justify-between text-left">
              <h4 className="text-sm font-semibold text-slate-900">
                밸류에이션
              </h4>
              <span className="text-xs font-semibold text-slate-500">
                {openSections.valuation ? "접기" : "펼치기"}
              </span>
            </button>
            {openSections.valuation && (
              <>
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
                  <div className="rounded-xl bg-slate-100 px-3 py-2">
                    <div className="text-xs text-slate-500">PER</div>
                    <div className="font-semibold text-slate-900">
                      {formatMetric(report.sections.valuation.per)}
                    </div>
                  </div>
                  <div className="rounded-xl bg-slate-100 px-3 py-2">
                    <div className="text-xs text-slate-500">PBR</div>
                    <div className="font-semibold text-slate-900">
                      {formatMetric(report.sections.valuation.pbr)}
                    </div>
                  </div>
                  <div className="rounded-xl bg-slate-100 px-3 py-2">
                    <div className="text-xs text-slate-500">ROE</div>
                    <div className="font-semibold text-slate-900">
                      {formatMetric(report.sections.valuation.roe)}
                    </div>
                  </div>
                  <div className="rounded-xl bg-slate-100 px-3 py-2">
                    <div className="text-xs text-slate-500">EPS</div>
                    <div className="font-semibold text-slate-900">
                      {formatMetric(report.sections.valuation.eps)}
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-7 text-slate-700">
                  {report.sections.valuation.interpretation}
                </p>
              </>
            )}
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5">
            <button
              type="button"
              onClick={() =>
                setOpenSections((prev) => ({
                  ...prev,
                  opinion: !prev.opinion,
                }))
              }
              className="flex w-full items-center justify-between text-left">
              <h4 className="text-sm font-semibold text-slate-900">
                투자 의견
              </h4>
              <span className="text-xs font-semibold text-slate-500">
                {openSections.opinion ? "접기" : "펼치기"}
              </span>
            </button>
            {openSections.opinion && (
              <div className="mt-3 grid gap-4">
                <div>
                  <div className="text-xs font-semibold text-emerald-700">
                    장점
                  </div>
                  <div className="mt-2 rounded-xl bg-slate-100 px-3 py-2">
                    <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-slate-700">
                      {report.sections.investment_opinion.pros.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-rose-700">
                    유의점
                  </div>
                  <div className="mt-2 rounded-xl bg-slate-100 px-3 py-2">
                    <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-slate-700">
                      {report.sections.investment_opinion.cons.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                {report.sections.investment_opinion.checkpoints &&
                  report.sections.investment_opinion.checkpoints.length > 0 && (
                    <div>
                      <div className="text-xs font-semibold text-amber-700">
                        체크포인트
                      </div>
                      <div className="mt-2 rounded-xl bg-slate-100 px-3 py-2">
                        <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-slate-700">
                          {report.sections.investment_opinion.checkpoints.map(
                            (item) => (
                              <li key={item}>{item}</li>
                            ),
                          )}
                        </ul>
                      </div>
                    </div>
                  )}
                {report.sections.investment_opinion.perspective && (
                  <div>
                    <div className="text-xs font-semibold text-sky-700">
                      기간별 관점
                    </div>
                    <div className="mt-2 grid gap-2 sm:grid-cols-3">
                      <PerspectiveCard
                        label="단기"
                        text={
                          report.sections.investment_opinion.perspective
                            .short_term
                        }
                      />
                      <PerspectiveCard
                        label="중기"
                        text={
                          report.sections.investment_opinion.perspective
                            .mid_term
                        }
                      />
                      <PerspectiveCard
                        label="장기"
                        text={
                          report.sections.investment_opinion.perspective
                            .long_term
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </article>
        </>
      )}
    </div>
  );
}

function PerspectiveCard({ label, text }: { label: string; text?: string }) {
  if (!text) return null;
  return (
    <div className="rounded-xl bg-slate-100 px-3 py-2 text-sm leading-6 text-slate-700">
      <div className="text-[11px] font-semibold text-slate-500">{label}</div>
      <p className="mt-1">{text}</p>
    </div>
  );
}
