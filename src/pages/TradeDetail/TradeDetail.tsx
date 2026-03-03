import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  AI_SUGGESTED_QUESTIONS,
  AI_WELCOME_MESSAGE,
  type AiMessage,
  buildAiAnswer,
  getDetailedReport,
  getTradeRecords,
  TRADE_PERIOD_OPTIONS,
  TRADE_SCOPE_OPTIONS,
  type TradePeriod,
} from "@/mocks/tradeDetail";

export default function TradeDetail() {
  const { userId } = useParams();
  const [selectedScopeId, setSelectedScopeId] = useState<string>("all");
  const [selectedPeriod, setSelectedPeriod] = useState<TradePeriod>("1m");
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<AiMessage[]>([AI_WELCOME_MESSAGE]);

  const selectedScope = useMemo(
    () =>
      TRADE_SCOPE_OPTIONS.find((scope) => scope.id === selectedScopeId) ??
      TRADE_SCOPE_OPTIONS[0],
    [selectedScopeId],
  );

  const report = useMemo(
    () => getDetailedReport(selectedScopeId, selectedPeriod),
    [selectedScopeId, selectedPeriod],
  );

  const trades = useMemo(
    () => getTradeRecords(selectedScopeId, selectedPeriod),
    [selectedScopeId, selectedPeriod],
  );

  const selectedPeriodLabel = useMemo(
    () =>
      TRADE_PERIOD_OPTIONS.find((option) => option.id === selectedPeriod)
        ?.label ?? "1달",
    [selectedPeriod],
  );

  const formatCurrency = (value: number) =>
    `${value.toLocaleString("ko-KR")}원`;

  const formatRatio = (value: number) => `${value.toFixed(1)}%`;

  const handleAskQuestion = (question: string) => {
    const assistantAnswer = buildAiAnswer(question, report);
    setMessages((prev) => [
      ...prev,
      { role: "user", content: question },
      { role: "assistant", content: assistantAnswer },
    ]);
  };

  const handleSendMessage = () => {
    const normalized = chatInput.trim();
    if (!normalized) {
      return;
    }
    handleAskQuestion(normalized);
    setChatInput("");
  };

  return (
    <>
      <div className="space-y-5 py-6">
        <header className="rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-[0_12px_40px_-32px_rgba(15,23,42,0.5)]">
          <h1 className="mt-1 text-lg font-semibold text-slate-900">
            거래내역 상세 리포트
          </h1>
        </header>

        <div className="grid grid-cols-[120px_minmax(0,1fr)] gap-3 md:grid-cols-[180px_minmax(0,1fr)] md:gap-4">
          <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_12px_40px_-32px_rgba(15,23,42,0.5)]">
            <p className="text-xs font-semibold text-slate-500">종목 선택</p>
            <div className="mt-3 space-y-2">
              {TRADE_SCOPE_OPTIONS.map((scope) => {
                const active = scope.id === selectedScopeId;
                const scopeReport = getDetailedReport(scope.id, selectedPeriod);
                return (
                  <button
                    key={scope.id}
                    type="button"
                    onClick={() => setSelectedScopeId(scope.id)}
                    className={`w-full rounded-2xl border px-3 py-2 text-left transition ${
                      active
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                    }`}>
                    <div className="flex items-center justify-between text-sm font-semibold">
                      <span>{scope.label}</span>
                    </div>
                    <p
                      className={`mt-1 text-xs ${
                        active ? "text-slate-300" : "text-slate-500"
                      }`}>
                      {" "}
                      {formatCurrency(scopeReport.summary.realizedProfit)}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_12px_40px_-32px_rgba(15,23,42,0.5)]">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-500">거래내역</p>
              <p className="text-xs text-slate-500">
                {selectedScope.label} · 최근 {selectedPeriodLabel}
              </p>
            </div>
            <div className="mt-3 max-h-[360px] overflow-auto rounded-2xl border border-slate-200">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-100 text-xs text-slate-600">
                  <tr>
                    <th className="px-3 py-2 text-left">일자</th>
                    <th className="px-3 py-2 text-left">종목</th>
                    <th className="px-3 py-2 text-left">구분</th>
                    <th className="px-3 py-2 text-right">수량</th>
                    <th className="px-3 py-2 text-right">체결가</th>
                    <th className="px-3 py-2 text-right">금액</th>
                    <th className="px-3 py-2 text-right">실현손익</th>
                  </tr>
                </thead>
                <tbody>
                  {trades.map((trade) => (
                    <tr key={trade.id} className="border-t border-slate-100">
                      <td className="whitespace-nowrap px-3 py-2 text-xs text-slate-500">
                        {trade.tradeDate}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-slate-800">
                        {trade.stockName}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-semibold ${
                            trade.type === "매수"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}>
                          {trade.type}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-right text-slate-700">
                        {trade.quantity.toLocaleString("ko-KR")}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-right text-slate-700">
                        {formatCurrency(trade.price)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-right text-slate-700">
                        {formatCurrency(trade.amount)}
                      </td>
                      <td
                        className={`whitespace-nowrap px-3 py-2 text-right font-semibold ${
                          trade.realizedProfit >= 0
                            ? "text-emerald-600"
                            : "text-rose-600"
                        }`}>
                        {formatCurrency(trade.realizedProfit)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_12px_40px_-32px_rgba(15,23,42,0.5)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-semibold text-slate-500">상세 리포트</p>
            <div className="flex items-center rounded-full bg-slate-100 p-1">
              {TRADE_PERIOD_OPTIONS.map((option) => {
                const active = option.id === selectedPeriod;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setSelectedPeriod(option.id)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                      active
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}>
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-3 space-y-3">
            <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-sm font-semibold text-slate-900">
                기간 요약
              </h3>
              <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">
                {`${report.periodLabel} 동안 총 ${report.summary.totalTrades}회의 거래가 있었습니다.\n\n총 매수 금액은 ${formatCurrency(report.summary.totalBuyAmount)},\n총 매도 금액은 ${formatCurrency(report.summary.totalSellAmount)}입니다.\n\n실현손익은 ${formatCurrency(report.summary.realizedProfit)}이며,\n총 손익률은 ${formatRatio(report.summary.totalReturnRate)}입니다.`}
              </p>
              {typeof report.summary.evaluationProfit === "number" && (
                <p className="mt-2 text-xs text-slate-500">
                  평가손익: {formatCurrency(report.summary.evaluationProfit)}
                </p>
              )}
            </article>

            <article className="rounded-2xl border border-slate-200 p-4">
              <h3 className="text-sm font-semibold text-slate-900">
                거래 성향 분석
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                평균 보유 기간은 {report.holdingTrend.averageHoldingDays}
                일입니다.
                <br />
                이는 '{report.holdingTrend.classification.label} (
                {report.holdingTrend.classification.range})' 구간에 해당합니다.
              </p>
            </article>

            {report.frequencyChange && (
              <article className="rounded-2xl border border-slate-200 p-4">
                <h3 className="text-sm font-semibold text-slate-900">
                  매매 빈도 변화
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  이전 기간 거래 횟수는 {report.frequencyChange.previousTrades}
                  회, 이번 기간 거래 횟수는{" "}
                  {report.frequencyChange.currentTrades}회입니다.
                  <br />
                  거래 횟수는 {formatRatio(
                    report.frequencyChange.changeRate,
                  )}{" "}
                  변화했습니다.
                </p>
              </article>
            )}

            {report.averagingPattern && (
              <article className="rounded-2xl border border-slate-200 p-4">
                <h3 className="text-sm font-semibold text-slate-900">
                  물타기 패턴 분석
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  {report.averagingPattern.stockName}를 총{" "}
                  {report.averagingPattern.totalBuyCount}회 매수했습니다.
                  <br />
                  최초 평균 매수 가격은{" "}
                  {formatCurrency(report.averagingPattern.firstAverageBuyPrice)}
                  이며, 이후 매수 가격은{" "}
                  {report.averagingPattern.followupBuyPrices
                    .map(formatCurrency)
                    .join(", ")}
                  입니다.
                  <br />
                  하락 구간 추가 매수 조건에 해당합니다.
                </p>
              </article>
            )}

            <article className="rounded-2xl border border-slate-200 p-4">
              <h3 className="text-sm font-semibold text-slate-900">
                종목 집중도 분석
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                전체 매수 금액 중 {report.concentration.topStockName} 비중은{" "}
                {formatRatio(report.concentration.ratio)}입니다.
                <br />
                이는 '{report.concentration.classification.label} (
                {report.concentration.classification.range})' 구간에 해당합니다.
              </p>
            </article>

            <article className="rounded-2xl border border-slate-200 p-4">
              <h3 className="text-sm font-semibold text-slate-900">
                손익 변동성 분석
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                기간 중 최대 손익 변동폭은 {formatRatio(report.volatility.rate)}
                입니다.
                <br />
                이는 '{report.volatility.classification.label} (
                {report.volatility.classification.range})' 에 해당합니다.
              </p>
            </article>

            <article className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-semibold text-amber-900">
                리스크 관찰 포인트
              </h3>
              <p className="mt-2 text-sm leading-6 text-amber-900">
                {report.riskObservation}
              </p>
            </article>

            <article className="rounded-2xl border border-slate-200 p-4">
              <h3 className="text-sm font-semibold text-slate-900">
                종목/전체 요약
              </h3>
              <p className="mt-2 text-sm text-slate-700">
                {report.flowSummary}
              </p>
              {report.overallStockSummary && (
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <div className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">
                    상위 종목: {report.overallStockSummary.topStock.name}
                    <br />
                    실현손익{" "}
                    {formatCurrency(
                      report.overallStockSummary.topStock.realizedProfit,
                    )}{" "}
                    / 수익률{" "}
                    {formatRatio(
                      report.overallStockSummary.topStock.returnRate,
                    )}
                  </div>
                  <div className="rounded-xl bg-rose-50 p-3 text-sm text-rose-800">
                    하위 종목: {report.overallStockSummary.bottomStock.name}
                    <br />
                    실현손익{" "}
                    {formatCurrency(
                      report.overallStockSummary.bottomStock.realizedProfit,
                    )}{" "}
                    / 수익률{" "}
                    {formatRatio(
                      report.overallStockSummary.bottomStock.returnRate,
                    )}
                  </div>
                </div>
              )}
              {report.selectedStockSummary && (
                <div className="mt-3 rounded-xl bg-slate-100 p-3 text-sm text-slate-700">
                  {report.selectedStockSummary.name} 실현손익{" "}
                  {formatCurrency(report.selectedStockSummary.realizedProfit)} /
                  수익률 {formatRatio(report.selectedStockSummary.returnRate)}
                </div>
              )}
            </article>

            {typeof report.insufficientPeriodNoticeDays === "number" && (
              <article className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-900">
                선택하신 기간 동안의 거래내역이 충분하지 않아 현재 거래내역{" "}
                {report.insufficientPeriodNoticeDays}일을 기준으로 리포트를
                표시했어요.
                <br />
                자세한 거래내역은 상단 거래내역 패널에서 확인하세요.
              </article>
            )}
          </div>

          <button
            type="button"
            className="mt-4 w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800">
            요약 리포트 챗봇으로 보기
          </button>
        </section>
      </div>

      <button
        type="button"
        onClick={() => setIsAiPanelOpen(true)}
        className="fixed right-6 bottom-6 z-30 rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-lg hover:bg-slate-800">
        주토피아 AI
      </button>

      {isAiPanelOpen && (
        <aside className="fixed inset-y-0 right-0 z-40 flex w-full max-w-[420px] flex-col border-l border-slate-200 bg-white shadow-2xl">
          <div className="flex items-start justify-between border-b border-slate-200 px-4 py-4">
            <div>
              <p className="text-base font-semibold text-slate-900">
                주토피아 AI
              </p>
              <p className="text-xs text-slate-500">
                {selectedScope.label} · 최근 {selectedPeriodLabel} 기준
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAiPanelOpen(false)}
              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">
              닫기
            </button>
          </div>

          <div className="border-b border-slate-200 px-4 py-3">
            <p className="text-xs font-semibold text-slate-500">추천 질문</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {AI_SUGGESTED_QUESTIONS.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => handleAskQuestion(question)}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700 hover:bg-slate-100">
                  {question}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((message, idx) => (
              <div
                key={`${message.role}-${idx}`}
                className={`max-w-[90%] rounded-2xl px-3 py-2 text-sm leading-6 ${
                  message.role === "assistant"
                    ? "bg-slate-100 text-slate-800"
                    : "ml-auto bg-slate-900 text-white"
                }`}>
                <p className="whitespace-pre-line">{message.content}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-200 p-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="리포트에서 궁금한 점을 입력하세요"
                className="h-10 flex-1 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-slate-400"
              />
              <button
                type="button"
                onClick={handleSendMessage}
                className="h-10 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white">
                전송
              </button>
            </div>
          </div>
        </aside>
      )}
    </>
  );
}
