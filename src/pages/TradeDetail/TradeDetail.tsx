import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTradeDetailQuery } from "@/hooks/queries/useTradeDetailQuery";
import { useAccountSession } from "@/hooks/useAccountSession";
import { TRADE_PERIOD_OPTIONS, TRADE_SCOPE_OPTIONS } from "@/mocks/tradeDetail";
import type { TradeDetailResponse, TradePeriod } from "@/types/tradeDetail";

export default function TradeDetail() {
	const { userId } = useParams<{ userId: string }>();
	const accountSession = useAccountSession();
	const navigate = useNavigate();
	const isSignedIn = Boolean(accountSession?.userId);
	const [selectedScopeId, setSelectedScopeId] = useState<string>("all");
	const [selectedPeriod, setSelectedPeriod] = useState<TradePeriod>("1m");
	const [demoMode, setDemoMode] = useState(false);

	// 종목 picker 옵션을 매번 응답에서 다시 만들면 단일 종목 선택 시 옵션이
	// 1개로 줄어드니, scope=all 응답이 도착하면 그 시점의 by_stock 을 캐시해서
	// 단일 종목 선택 후에도 picker 가 전체 종목을 계속 표시하도록 함.
	const [cachedScopeOptions, setCachedScopeOptions] = useState<
		{ id: string; label: string; ticker?: string }[]
	>([]);

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
		enabled: isSignedIn,
		demo: demoMode,
	});

	const report = useMemo(
		() => reportData ?? fallbackReport,
		[fallbackReport, reportData],
	);

	// scope === all 응답 도착할 때마다 picker 옵션을 캐시
	useEffect(() => {
		if (selectedScopeId !== "all") return;
		const list = reportData?.by_stock_summary ?? [];
		if (list.length === 0) return;
		const opts = [
			{ id: "all", label: "전체" },
			...list
				.map((s) => ({
					id: s.ticker ?? s.symbol ?? "",
					label: s.name || (s.ticker ?? s.symbol ?? ""),
					ticker: s.ticker ?? s.symbol,
				}))
				.filter((o) => o.id),
		];
		setCachedScopeOptions(opts);
	}, [reportData?.by_stock_summary, selectedScopeId]);

	const scopeOptions =
		cachedScopeOptions.length > 0 ? cachedScopeOptions : TRADE_SCOPE_OPTIONS;
	const selectedScope =
		scopeOptions.find((scope) => scope.id === selectedScopeId) ??
		scopeOptions[0];

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
				<div className="flex flex-wrap items-center justify-between gap-3">
					<h1 className="mt-1 text-lg font-semibold text-slate-900">
						거래내역 상세 리포트
						{demoMode && (
							<span className="ml-2 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 align-middle">
								🎨 데모
							</span>
						)}
					</h1>
					<label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none">
						<input
							type="checkbox"
							checked={demoMode}
							onChange={(e) => setDemoMode(e.target.checked)}
							className="h-4 w-4 rounded border-slate-300"
						/>
						<span>데모 데이터 보기</span>
					</label>
				</div>
				{demoMode && (
					<p className="mt-2 text-xs text-amber-700">
						보유 종목 기반 가상 거래로 시연된 응답입니다 (실 거래내역 아님).
					</p>
				)}
			</header>

			{isSignedIn && !demoMode && hasNoTradesInPeriod && !isLoading && (
				<section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_12px_40px_-32px_rgba(15,23,42,0.5)]">
					<p className="text-sm text-slate-700">
						선택하신 기간 동안의 거래내역이 없어요.
					</p>
					<p className="mt-1 text-xs text-slate-500">
						모의 계좌라 실 매매 기록이 없거나, 장이 닫혀있는 동안 아직 거래가 발생하지 않았어요.
					</p>
					<button
						type="button"
						onClick={() => setDemoMode(true)}
						className="mt-3 inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
					>
						🎨 데모 데이터로 리포트 보기
					</button>
				</section>
			)}

			{!isSignedIn ? (
				<section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_12px_40px_-32px_rgba(15,23,42,0.5)]">
					<div className="rounded-2xl bg-slate-50 px-4 py-5">
						<p className="text-sm font-bold text-slate-900">
							거래 내역 리포트는 로그인 후 조회할 수 있습니다.
						</p>
						<div className="mt-4 grid grid-cols-2 gap-2">
							<button
								type="button"
								onClick={() => navigate("/login")}
								className="w-full rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
							>
								로그인
							</button>
							<button
								type="button"
								onClick={() => navigate("/login?mode=signup")}
								className="w-full rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
							>
								회원가입
							</button>
						</div>
					</div>
				</section>
			) : (
				<>
					<div className="grid grid-cols-1 gap-4">
						<section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_12px_40px_-32px_rgba(15,23,42,0.5)]">
							<p className="text-xs font-semibold text-slate-500">
								종목 선택 <span className="text-slate-400">({scopeOptions.length - 1} 종목)</span>
							</p>
							<div className="mt-3 flex flex-wrap gap-2">
								{scopeOptions.map((scope) => {
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

						{(report.transactions?.length ?? 0) > 0 && (
							<section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_12px_40px_-32px_rgba(15,23,42,0.5)]">
								<div className="flex items-center justify-between">
									<p className="text-xs font-semibold text-slate-500">
										개별 거래 내역
									</p>
									<p className="text-xs text-slate-500">
										{selectedScope.label} · 최근 {selectedPeriodLabel} ·{" "}
										{report.transactions?.length ?? 0}건
									</p>
								</div>
								<div className="mt-3 max-h-[320px] overflow-auto rounded-2xl border border-slate-200">
									<table className="min-w-full text-sm">
										<thead className="bg-slate-100 text-xs text-slate-600">
											<tr>
												<th className="px-3 py-2 text-left">날짜</th>
												<th className="px-3 py-2 text-left">종목</th>
												<th className="px-3 py-2 text-center">구분</th>
												<th className="px-3 py-2 text-right">수량</th>
												<th className="px-3 py-2 text-right">단가</th>
												<th className="px-3 py-2 text-right">금액</th>
											</tr>
										</thead>
										<tbody>
											{report.transactions?.map((tx, i) => {
												const d = tx.date ?? "";
												const dateLabel =
													d.length === 8
														? `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`
														: d;
												return (
													<tr
														key={`${tx.date}-${tx.ticker}-${tx.side}-${i}`}
														className="border-t border-slate-100"
													>
														<td className="whitespace-nowrap px-3 py-2 text-slate-700">
															{dateLabel}
														</td>
														<td className="whitespace-nowrap px-3 py-2 text-slate-800">
															{tx.name} ({tx.ticker})
														</td>
														<td className="whitespace-nowrap px-3 py-2 text-center">
															<span
																className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
																	tx.side === "buy"
																		? "bg-rose-50 text-rose-700"
																		: "bg-emerald-50 text-emerald-700"
																}`}
															>
																{tx.side_label ?? (tx.side === "buy" ? "매수" : "매도")}
															</span>
														</td>
														<td className="whitespace-nowrap px-3 py-2 text-right text-slate-700">
															{tx.quantity?.toLocaleString("ko-KR")}주
														</td>
														<td className="whitespace-nowrap px-3 py-2 text-right text-slate-700">
															{tx.price?.toLocaleString("ko-KR")}원
														</td>
														<td className="whitespace-nowrap px-3 py-2 text-right font-semibold text-slate-900">
															{tx.amount?.toLocaleString("ko-KR")}원
														</td>
													</tr>
												);
											})}
										</tbody>
									</table>
								</div>
							</section>
						)}

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
										{report.by_stock_summary.map((stock) => {
											const sid = stock.ticker ?? stock.symbol ?? "";
											return (
											<tr
												key={sid}
												className="border-t border-slate-100"
											>
												<td className="whitespace-nowrap px-3 py-2 text-slate-800">
													{stock.name} ({sid})
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
										);
									})}
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
							<p className="text-xs font-semibold text-slate-500">
								상세 리포트
							</p>
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

									{/* 분석 섹션 — 백엔드의 prose `text` 필드 1순위. 개별 필드는
									    백엔드/프론트 명명이 달라 undefined.toFixed 류 throw 위험 큼 */}
									{(() => {
										const t = report.trading_tendency;
										const text =
											t?.text ??
											(t?.avg_holding_days != null
												? `평균 보유 기간은 ${t.avg_holding_days}일입니다.`
												: null);
										if (!text) return null;
										return (
											<article className="rounded-2xl border border-slate-200 p-4">
												<h3 className="text-sm font-semibold text-slate-900">
													거래 성향 분석
												</h3>
												<p className="mt-2 text-sm leading-6 text-slate-700 whitespace-pre-line">
													{text}
												</p>
											</article>
										);
									})()}

									{(() => {
										const f = report.frequency_change;
										const text =
											f?.text ??
											(f?.buy_frequency
												? `매수 빈도는 ${f.buy_frequency}, 매도 빈도는 ${f.sell_frequency ?? "-"}입니다.`
												: null);
										if (!text) return null;
										return (
											<article className="rounded-2xl border border-slate-200 p-4">
												<h3 className="text-sm font-semibold text-slate-900">
													매매 빈도 변화
												</h3>
												<p className="mt-2 text-sm leading-6 text-slate-700 whitespace-pre-line">
													{text}
												</p>
											</article>
										);
									})()}

									{(() => {
										const w = report.water_down_pattern;
										const text =
											w?.text ??
											(w?.count != null
												? `물타기 매매는 총 ${w.count}회 감지되었습니다.`
												: null);
										if (!text) return null;
										return (
											<article className="rounded-2xl border border-slate-200 p-4">
												<h3 className="text-sm font-semibold text-slate-900">
													물타기 패턴 분석
												</h3>
												<p className="mt-2 text-sm leading-6 text-slate-700 whitespace-pre-line">
													{text}
												</p>
											</article>
										);
									})()}

									{(() => {
										const c = report.concentration_analysis;
										if (!c) {
											return (
												<article className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-500">
													종목 집중도 분석 데이터가 없습니다.
												</article>
											);
										}
										const top = c.top_stock_name ?? c.top_stock;
										const ratio = c.top_stock_ratio ?? c.concentration_rate;
										const text =
											c.text ??
											(top && ratio != null
												? `전체 거래 중 ${top} 비중은 ${ratio.toFixed(1)}% 입니다.`
												: null);
										return (
											<article className="rounded-2xl border border-slate-200 p-4">
												<h3 className="text-sm font-semibold text-slate-900">
													종목 집중도 분석
												</h3>
												<p className="mt-2 text-sm leading-6 text-slate-700 whitespace-pre-line">
													{text ?? "데이터가 없습니다."}
												</p>
											</article>
										);
									})()}

									{(() => {
										const v = report.volatility_analysis;
										const rate = v?.volatility_rate ?? v?.avg_volatility;
										const text =
											v?.text ??
											(rate != null
												? `손익 변동폭은 ${rate.toFixed(1)}% 입니다.`
												: null);
										if (!text) return null;
										return (
											<article className="rounded-2xl border border-slate-200 p-4">
												<h3 className="text-sm font-semibold text-slate-900">
													손익 변동성 분석
												</h3>
												<p className="mt-2 text-sm leading-6 text-slate-700 whitespace-pre-line">
													{text}
												</p>
											</article>
										);
									})()}

									{(() => {
										const r = report.risk_observation;
										const text = r?.text ?? r?.message;
										if (!text) return null;
										return (
											<article className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
												<h3 className="text-sm font-semibold text-amber-900">
													리스크 관찰 포인트
												</h3>
												<p className="mt-2 text-sm leading-6 text-amber-900 whitespace-pre-line">
													{text}
												</p>
											</article>
										);
									})()}

									<article className="rounded-2xl border border-slate-200 p-4">
										<h3 className="text-sm font-semibold text-slate-900">
											종목/전체 요약
										</h3>
										{(() => {
											const n = report.narrative;
											if (!n) {
												return (
													<p className="mt-2 text-sm text-slate-500">
														종목/전체 요약 데이터가 없습니다.
													</p>
												);
											}
											if (typeof n === "string") {
												return (
													<p className="mt-2 text-sm text-slate-700 whitespace-pre-line">
														{n}
													</p>
												);
											}
											const sections: { label: string; text?: string }[] = [
												{ label: "흐름", text: n.flow },
												{ label: "패턴", text: n.pattern },
												{ label: "리스크", text: n.risk_point },
												{ label: "관찰", text: n.observation },
											].filter((s) => s.text);
											if (sections.length === 0) {
												return (
													<p className="mt-2 text-sm text-slate-500">
														종목/전체 요약 데이터가 없습니다.
													</p>
												);
											}
											return (
												<div className="mt-2 space-y-2 text-sm text-slate-700">
													{sections.map((s) => (
														<p
															key={s.label}
															className="whitespace-pre-line"
														>
															<span className="font-semibold text-slate-900">
																{s.label}.
															</span>{" "}
															{s.text}
														</p>
													))}
												</div>
											);
										})()}
										{report.by_stock_summary.length > 0 && (
											<div className="mt-3 grid gap-2 sm:grid-cols-2">
												{report.by_stock_summary.map((stock, index) => (
													<div
														key={`${stock.ticker ?? stock.symbol ?? "x"}-${index}`}
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

							{report.period_insufficient &&
								report.period_insufficient_message && (
									<article className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-900">
										{report.period_insufficient_message}
										<br />
										자세한 요약은 상단 종목별 거래 요약 패널에서 확인하세요.
									</article>
								)}
						</div>
					</section>
				</>
			)}
		</div>
	);
}
