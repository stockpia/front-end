import { useState } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import type { StockReportResponse } from "@/types/stockCommunityNews";

type StockReportSectionProps = {
  isLoading: boolean;
  isError: boolean;
  errorMessage: string;
  report: StockReportResponse | null;
};

type Tone = "positive" | "neutral" | "warning" | "negative" | "muted";

const TONE_BG: Record<Tone, string> = {
  positive: "bg-emerald-50",
  neutral: "bg-slate-100",
  warning: "bg-amber-50",
  negative: "bg-rose-50",
  muted: "bg-slate-50",
};

const TONE_TEXT: Record<Tone, string> = {
  positive: "text-emerald-700",
  neutral: "text-slate-900",
  warning: "text-amber-700",
  negative: "text-rose-700",
  muted: "text-slate-400",
};

const TONE_BADGE: Record<Tone, string> = {
  positive: "bg-emerald-100 text-emerald-700",
  neutral: "bg-slate-200 text-slate-600",
  warning: "bg-amber-100 text-amber-700",
  negative: "bg-rose-100 text-rose-700",
  muted: "bg-slate-100 text-slate-400",
};

type MetricKey = "per" | "pbr" | "roe" | "eps";

const METRIC_LABELS: Record<MetricKey, { full: string; hint: string }> = {
  per: { full: "PER", hint: "주가수익비율 (낮을수록 저평가)" },
  pbr: { full: "PBR", hint: "주가순자산비율 (낮을수록 저평가)" },
  roe: { full: "ROE", hint: "자기자본수익률 (높을수록 효율)" },
  eps: { full: "EPS", hint: "주당순이익" },
};

// 한국 시장 평균 기준 — 코스피 PER 10-15, PBR 1-1.5 등
function assessMetric(
  key: MetricKey,
  value?: number,
): { label: string; tone: Tone } {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return { label: "N/A", tone: "muted" };
  }
  switch (key) {
    case "per":
      if (value <= 0) return { label: "적자", tone: "negative" };
      if (value < 10) return { label: "저평가", tone: "positive" };
      if (value < 20) return { label: "적정", tone: "neutral" };
      return { label: "고평가", tone: "warning" };
    case "pbr":
      if (value <= 0) return { label: "음수", tone: "negative" };
      if (value < 1) return { label: "저평가", tone: "positive" };
      if (value < 2) return { label: "적정", tone: "neutral" };
      return { label: "고평가", tone: "warning" };
    case "roe":
      if (value < 0) return { label: "손실", tone: "negative" };
      if (value < 5) return { label: "부족", tone: "warning" };
      if (value < 15) return { label: "양호", tone: "neutral" };
      return { label: "우량", tone: "positive" };
    case "eps":
      if (value < 0) return { label: "적자", tone: "negative" };
      if (value === 0) return { label: "보합", tone: "muted" };
      return { label: "흑자", tone: "positive" };
  }
}

function formatMetricValue(key: MetricKey, value?: number): string {
  if (typeof value !== "number" || Number.isNaN(value)) return "—";
  if (key === "per" || key === "pbr") return value.toFixed(2);
  if (key === "roe") return `${value.toFixed(2)}%`;
  return value.toLocaleString("ko-KR");
}

function changeRateTone(value?: number): Tone {
  if (typeof value !== "number" || Number.isNaN(value)) return "muted";
  if (value > 0) return "negative"; // 한국 시장 컨벤션: 상승=빨강
  if (value < 0) return "positive"; // 하락=파랑/초록 → 여기선 emerald
  return "neutral";
}

function formatGeneratedAt(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mi = String(date.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
}

export default function StockReportSection({
  isLoading,
  isError,
  errorMessage,
  report,
}: StockReportSectionProps) {
  const [openSections, setOpenSections] = useState({
    keyPoints: true,
    valuation: true,
    opinion: true,
  });

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
          {/* 투자 요약 — 종목명/생성시간 + AI 요약 + 핵심 4 지표 */}
          <article className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">
                {report.company_name}
              </span>
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
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              <SummaryCard
                label="현재가"
                value={
                  typeof report.summary.current_price === "number"
                    ? `${report.summary.current_price.toLocaleString("ko-KR")}원`
                    : "—"
                }
                tone="neutral"
              />
              <SummaryCard
                label="당일 변동률"
                value={
                  typeof report.summary.price_change_pct === "number"
                    ? `${report.summary.price_change_pct >= 0 ? "+" : ""}${report.summary.price_change_pct.toFixed(2)}%`
                    : "—"
                }
                tone={changeRateTone(report.summary.price_change_pct)}
              />
              <SummaryCard
                label="1년 수익률"
                value={
                  typeof report.summary.return_1y === "number"
                    ? `${report.summary.return_1y >= 0 ? "+" : ""}${report.summary.return_1y.toFixed(2)}%`
                    : "—"
                }
                tone={changeRateTone(report.summary.return_1y)}
              />
              <SummaryCard label="RSI" value={report.summary.rsi} tone="neutral" />
            </div>
          </article>

          {/* 핵심 포인트 */}
          <article className="rounded-2xl border border-slate-200 bg-white p-5">
            <button
              type="button"
              onClick={() =>
                setOpenSections((prev) => ({
                  ...prev,
                  keyPoints: !prev.keyPoints,
                }))
              }
              className="flex w-full items-center justify-between text-left"
            >
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
                  {report.sections.investment_summary.key_points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
                <div className="mt-4 rounded-xl border border-amber-100 bg-amber-50/60 px-3 py-2 text-sm leading-7 text-amber-900">
                  <span className="mr-1 font-semibold">체크포인트</span>
                  {report.sections.investment_summary.checkpoint}
                </div>
              </>
            )}
          </article>

          {/* 밸류에이션 — 4 지표 카드 (값 + 상태 라벨 + 색상) */}
          <article className="rounded-2xl border border-slate-200 bg-white p-5">
            <button
              type="button"
              onClick={() =>
                setOpenSections((prev) => ({
                  ...prev,
                  valuation: !prev.valuation,
                }))
              }
              className="flex w-full items-center justify-between text-left"
            >
              <h4 className="text-sm font-semibold text-slate-900">밸류에이션</h4>
              <span className="text-xs font-semibold text-slate-500">
                {openSections.valuation ? "접기" : "펼치기"}
              </span>
            </button>
            {openSections.valuation && (
              <>
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {(["per", "pbr", "roe", "eps"] as const).map((k) => (
                    <ValuationCard
                      key={k}
                      metricKey={k}
                      value={report.sections.valuation?.[k]}
                    />
                  ))}
                </div>
                {report.sections.valuation?.interpretation ? (
                  <p className="mt-4 rounded-xl bg-slate-50 px-3 py-3 text-sm leading-7 text-slate-700">
                    {report.sections.valuation.interpretation}
                  </p>
                ) : (
                  <p className="mt-4 text-sm leading-7 text-slate-400">
                    밸류에이션 해석을 불러오지 못했어요.
                  </p>
                )}
              </>
            )}
          </article>

          {/* 투자 의견 — 장점/유의점 색상 강화 + 체크포인트 + 기간별 관점 */}
          <article className="rounded-2xl border border-slate-200 bg-white p-5">
            <button
              type="button"
              onClick={() =>
                setOpenSections((prev) => ({
                  ...prev,
                  opinion: !prev.opinion,
                }))
              }
              className="flex w-full items-center justify-between text-left"
            >
              <h4 className="text-sm font-semibold text-slate-900">투자 의견</h4>
              <span className="text-xs font-semibold text-slate-500">
                {openSections.opinion ? "접기" : "펼치기"}
              </span>
            </button>
            {openSections.opinion && (
              <div className="mt-3 grid gap-4">
                <ProsConsBlock
                  variant="pros"
                  title="긍정 요소"
                  items={report.sections.investment_opinion.pros}
                />
                <ProsConsBlock
                  variant="cons"
                  title="유의점"
                  items={report.sections.investment_opinion.cons}
                />
                {report.sections.investment_opinion.checkpoints &&
                  report.sections.investment_opinion.checkpoints.length > 0 && (
                    <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-3">
                      <div className="text-xs font-semibold text-amber-800">
                        체크포인트
                      </div>
                      <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-6 text-amber-900">
                        {report.sections.investment_opinion.checkpoints.map(
                          (item) => (
                            <li key={item}>{item}</li>
                          ),
                        )}
                      </ul>
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
                          report.sections.investment_opinion.perspective.mid_term
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

function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | number | undefined;
  tone: Tone;
}) {
  return (
    <div className={`rounded-xl ${TONE_BG[tone]} px-3 py-2`}>
      <div className="text-xs text-slate-500">{label}</div>
      <div
        className={`mt-0.5 font-semibold break-keep ${TONE_TEXT[tone]}`}
      >
        {value ?? "—"}
      </div>
    </div>
  );
}

function ValuationCard({
  metricKey,
  value,
}: {
  metricKey: MetricKey;
  value?: number;
}) {
  const assessment = assessMetric(metricKey, value);
  const display = formatMetricValue(metricKey, value);
  const meta = METRIC_LABELS[metricKey];

  return (
    <div className={`rounded-xl ${TONE_BG[assessment.tone]} px-3 py-3`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500">{meta.full}</span>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${TONE_BADGE[assessment.tone]}`}
        >
          {assessment.label}
        </span>
      </div>
      <div className={`mt-1 text-base font-bold ${TONE_TEXT[assessment.tone]}`}>
        {display}
      </div>
      <div className="mt-1 text-[10px] leading-4 text-slate-500">
        {meta.hint}
      </div>
    </div>
  );
}

function ProsConsBlock({
  variant,
  title,
  items,
}: {
  variant: "pros" | "cons";
  title: string;
  items: string[];
}) {
  const styles =
    variant === "pros"
      ? {
          container: "border-emerald-100 bg-emerald-50/60",
          title: "text-emerald-800",
          icon: "✓",
          iconBg: "bg-emerald-100 text-emerald-700",
        }
      : {
          container: "border-rose-100 bg-rose-50/60",
          title: "text-rose-800",
          icon: "⚠",
          iconBg: "bg-rose-100 text-rose-700",
        };
  return (
    <div className={`rounded-xl border ${styles.container} p-3`}>
      <div className="flex items-center gap-2">
        <span
          className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${styles.iconBg}`}
        >
          {styles.icon}
        </span>
        <span className={`text-xs font-semibold ${styles.title}`}>{title}</span>
      </div>
      <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-6 text-slate-700">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function PerspectiveCard({ label, text }: { label: string; text?: string }) {
  if (!text) return null;
  return (
    <div className="rounded-xl bg-sky-50/60 border border-sky-100 px-3 py-2 text-sm leading-6 text-slate-700">
      <div className="text-[11px] font-semibold text-sky-700">{label}</div>
      <p className="mt-1">{text}</p>
    </div>
  );
}
