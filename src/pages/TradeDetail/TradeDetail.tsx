import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useTradeDetailQuery } from "@/hooks/queries/useTradeDetailQuery";
import { TRADE_PERIOD_OPTIONS, TRADE_SCOPE_OPTIONS } from "@/mocks/tradeDetail";
import type { TradeDetailResponse, TradePeriod } from "@/types/tradeDetail";

export default function TradeDetail() {
	const { userId } = useParams<{ userId: string }>();
	const [selectedScopeId, setSelectedScopeId] = useState<string>("all");
	const [selectedPeriod, setSelectedPeriod] = useState<TradePeriod>("1m");

	const selectedScope = useMemo(
		() =>
			TRADE_SCOPE_OPTIONS.find((scope) => scope.id === selectedScopeId) ??
			TRADE_SCOPE_OPTIONS[0],
		[selectedScopeId],
	);

	const selectedSymbol = selectedScopeId === "all" ? "ALL" : selectedScopeId;

	const fallbackReport = useMemo<TradeDetailResponse>(
		() => ({
			scope: selectedSymbol,
			period: selectedPeriod,
			actual_period_days: 0,
			summary_metrics: {
				total_buy_amount: 0,
				total_sell_amount: 0,
				realized_profit: 0,
				eval_profit: 0,
				total_profit: 0,
				total_profit_rate: 0,
				buy_trades: 0,
				sell_trades: 0,
				total_trades: 0,
			},
			by_stock_summary: [],
			trading_tendency: null,
			frequency_change: null,
			water_down_pattern: null,
			concentration_analysis: null,
			volatility_analysis: null,
			risk_observation: null,
			narrative: null,
			period_insufficient: false,
			period_insufficient_message: null,
		}),
		[selectedPeriod, selectedSymbol],
	);

	const {
		report: reportData,
		isLoading,
		errorMessage,
	} = useTradeDetailQuery({
		symbol: selectedSymbol,
		userId,
		period: selectedPeriod,
	});

	const report = useMemo(
		() => reportData ?? fallbackReport,
		[fallbackReport, reportData],
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
	const hasNoTradesInPeriod =
		report.period_insufficient && report.summary_metrics.total_trades === 0;

	return (
		<div className="space-y-5 py-6">
			<header className="rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-[0_12px_40px_-32px_rgba(15,23,42,0.5)]">
				<h1 className="mt-1 text-lg font-semibold text-slate-900">
					거래내역 상세 리포트
				</h1>
			</header>

			<div className="grid grid-cols-1 gap-4">
				<section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_12px_40px_-32px_rgba(15,23,42,0.5)]">
					<p className="text-xs font-semibold text-slate-500">종목 선택</p>
					<div className="mt-3 flex flex-wrap gap-2">
						{TRADE_SCOPE_OPTIONS.map((scope) => {
							const active = scope.id === selectedScopeId;
							return (
								<button
									key={scope.id}
									type="button"
									onClick={() => setSelectedScopeId(scope.id)}
									className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
										active
											? "border-slate-900 bg-slate-900 text-white"
											: "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
									}`}
								>
									{scope.label}
								</button>
							);
						})}
					</div>
				</section>

				<section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_12px_40px_-32px_rgba(15,23,42,0.5)]">
					<div className="flex items-center justify-between">
						<p className="text-xs font-semibold text-slate-500">
							종목별 거래 요약
						</p>
						<p className="text-xs text-slate-500">
							{selectedScope.label} · 최근 {selectedPeriodLabel}
						</p>
					</div>
					<div className="mt-3 max-h-[360px] overflow-auto rounded-2xl border border-slate-200">
						<table className="min-w-full text-sm">
							<thead className="bg-slate-100 text-xs text-slate-600">
								<tr>
									<th className="px-3 py-2 text-left">종목</th>
									<th className="px-3 py-2 text-right">매수금액</th>
									<th className="px-3 py-2 text-right">매도금액</th>
									<th className="px-3 py-2 text-right">실현손익</th>
									<th className="px-3 py-2 text-right">수익률</th>
								</tr>
							</thead>
							<tbody>
								{report.by_stock_summary.map((stock) => (
									<tr key={stock.symbol} className="border-t border-slate-100">
										<td className="whitespace-nowrap px-3 py-2 text-slate-800">
											{stock.name} ({stock.symbol})
										</td>
										<td className="whitespace-nowrap px-3 py-2 text-right text-slate-700">
											{formatCurrency(stock.buy_amount)}
										</td>
										<td className="whitespace-nowrap px-3 py-2 text-right text-slate-700">
											{formatCurrency(stock.sell_amount)}
										</td>
										<td
											className={`whitespace-nowrap px-3 py-2 text-right font-semibold ${
												stock.realized_profit >= 0
													? "text-emerald-600"
													: "text-rose-600"
											}`}
										>
											{formatCurrency(stock.realized_profit)}
										</td>
										<td
											className={`whitespace-nowrap px-3 py-2 text-right font-semibold ${
												stock.profit_rate >= 0
													? "text-emerald-600"
													: "text-rose-600"
											}`}
										>
											{formatRatio(stock.profit_rate)}
										</td>
									</tr>
								))}
								{report.by_stock_summary.length === 0 && (
									<tr>
										<td
											colSpan={5}
											className="px-3 py-8 text-center text-sm text-slate-400"
										>
											표시할 종목별 거래 요약이 없습니다.
										</td>
									</tr>
								)}
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
									}`}
								>
									{option.label}
								</button>
							);
						})}
					</div>
				</div>

				<div className="mt-3 space-y-3">
					{isLoading && (
						<article className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
							리포트를 불러오는 중입니다.
						</article>
					)}

					{errorMessage && (
						<article className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
							{errorMessage}
						</article>
					)}

					{!hasNoTradesInPeriod && (
						<>
							<article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
								<h3 className="text-sm font-semibold text-slate-900">
									기간 요약
								</h3>
								<p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">
									{`최근 ${selectedPeriodLabel} 동안 총 ${report.summary_metrics.total_trades}회의 거래가 있었습니다.\n\n총 매수 금액은 ${formatCurrency(report.summary_metrics.total_buy_amount)},\n총 매도 금액은 ${formatCurrency(report.summary_metrics.total_sell_amount)}입니다.\n\n실현손익은 ${formatCurrency(report.summary_metrics.realized_profit)}이며,\n총 손익률은 ${formatRatio(report.summary_metrics.total_profit_rate)}입니다.`}
								</p>
								{report.summary_metrics.eval_profit !== 0 && (
									<p className="mt-2 text-xs text-slate-500">
										평가손익:{" "}
										{formatCurrency(report.summary_metrics.eval_profit)}
									</p>
								)}
							</article>

							{report.trading_tendency && (
								<article className="rounded-2xl border border-slate-200 p-4">
									<h3 className="text-sm font-semibold text-slate-900">
										거래 성향 분석
									</h3>
									<p className="mt-2 text-sm leading-6 text-slate-700">
										평균 보유 기간은 {report.trading_tendency.avg_holding_days}
										일입니다.
										<br />
										매수 활동일은 {report.trading_tendency.buy_days}일, 매도
										활동일은 {report.trading_tendency.sell_days}일입니다.
									</p>
								</article>
							)}

							{report.frequency_change && (
								<article className="rounded-2xl border border-slate-200 p-4">
									<h3 className="text-sm font-semibold text-slate-900">
										매매 빈도 변화
									</h3>
									<p className="mt-2 text-sm leading-6 text-slate-700">
										매수 빈도는 {report.frequency_change.buy_frequency}, 매도
										빈도는 {report.frequency_change.sell_frequency}입니다.
									</p>
								</article>
							)}

							{report.water_down_pattern && (
								<article className="rounded-2xl border border-slate-200 p-4">
									<h3 className="text-sm font-semibold text-slate-900">
										물타기 패턴 분석
									</h3>
									<p className="mt-2 text-sm leading-6 text-slate-700">
										물타기 매매는 총 {report.water_down_pattern.count}회
										감지되었습니다.
										<br />
										평균 손실 구간은{" "}
										{formatRatio(report.water_down_pattern.avg_loss_rate)}
										입니다.
									</p>
								</article>
							)}

							{report.concentration_analysis ? (
								<article className="rounded-2xl border border-slate-200 p-4">
									<h3 className="text-sm font-semibold text-slate-900">
										종목 집중도 분석
									</h3>
									<p className="mt-2 text-sm leading-6 text-slate-700">
										전체 거래 중 {report.concentration_analysis.top_stock}{" "}
										비중은{" "}
										{formatRatio(
											report.concentration_analysis.concentration_rate,
										)}
										입니다.
									</p>
								</article>
							) : (
								<article className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-500">
									종목 집중도 분석 데이터가 없습니다.
								</article>
							)}

							{report.volatility_analysis && (
								<article className="rounded-2xl border border-slate-200 p-4">
									<h3 className="text-sm font-semibold text-slate-900">
										손익 변동성 분석
									</h3>
									<p className="mt-2 text-sm leading-6 text-slate-700">
										평균 변동성은{" "}
										{formatRatio(report.volatility_analysis.avg_volatility)}
										입니다.
										<br />
										최대 변동일은{" "}
										{report.volatility_analysis.max_volatility_day}
										입니다.
									</p>
								</article>
							)}

							{report.risk_observation && (
								<article className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
									<h3 className="text-sm font-semibold text-amber-900">
										리스크 관찰 포인트
									</h3>
									<p className="mt-2 text-sm leading-6 text-amber-900">
										{report.risk_observation.message}
									</p>
								</article>
							)}

							<article className="rounded-2xl border border-slate-200 p-4">
								<h3 className="text-sm font-semibold text-slate-900">
									종목/전체 요약
								</h3>
								{report.narrative ? (
									<p className="mt-2 text-sm text-slate-700">
										{report.narrative}
									</p>
								) : (
									<p className="mt-2 text-sm text-slate-500">
										종목/전체 요약 데이터가 없습니다.
									</p>
								)}
								{report.by_stock_summary.length > 0 && (
									<div className="mt-3 grid gap-2 sm:grid-cols-2">
										{report.by_stock_summary.map((stock, index) => (
											<div
												key={`${stock.symbol}-${index}`}
												className={`rounded-xl p-3 text-sm ${
													stock.realized_profit >= 0
														? "bg-emerald-50 text-emerald-800"
														: "bg-rose-50 text-rose-800"
												}`}
											>
												{stock.name}
												<br />
												실현손익 {formatCurrency(stock.realized_profit)} /
												수익률 {formatRatio(stock.profit_rate)}
											</div>
										))}
									</div>
								)}
							</article>
						</>
					)}

					{report.period_insufficient && report.period_insufficient_message && (
						<article className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-900">
							{report.period_insufficient_message}
							<br />
							자세한 요약은 상단 종목별 거래 요약 패널에서 확인하세요.
						</article>
					)}
				</div>
			</section>
		</div>
	);
}
