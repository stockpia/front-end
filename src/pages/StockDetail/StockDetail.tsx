import { useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import ChartPanel, {
	type ChartRange,
	type ChartType,
} from "@/components/ChartPanel";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useStockChartQuery } from "@/hooks/queries/useStockChartQuery";
import { useStockReportQuery } from "@/hooks/queries/useStockCommunityNewsQueries";
import CommunityNewsSection from "@/pages/StockDetail/views/CommunityNewsSection";

type StockInsightTab = "report" | "news" | "community";

export default function StockDetail() {
	const navigate = useNavigate();
	const { stockId } = useParams();
	const [searchParams] = useSearchParams();
	const [range, setRange] = useState<ChartRange>("1d");
	const [chartType, setChartType] = useState<ChartType>("candlestick");
	const [activeInsightTab, setActiveInsightTab] =
		useState<StockInsightTab>("report");
	const [openReportSections, setOpenReportSections] = useState({
		keyPoints: false,
		valuation: false,
		opinion: false,
	});

	const symbolLabel = useMemo(() => {
		const nameParam = searchParams.get("name");
		if (nameParam && stockId) {
			return `${decodeURIComponent(nameParam)} (${stockId})`;
		}
		return stockId ? stockId : "선택된 종목";
	}, [searchParams, stockId]);

	const isHolding = true;
	const chartQuery = useStockChartQuery({
		symbol: stockId,
		range,
		type: chartType,
	});
	const stockReportQuery = useStockReportQuery({
		symbol: stockId,
		enabled: activeInsightTab === "report",
	});

	const report = stockReportQuery.report;

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
		<div className="space-y-8 py-8">
			<ChartPanel
				symbol={symbolLabel}
				range={range}
				onRangeChange={setRange}
				type={chartType}
				onTypeChange={setChartType}
				loading={chartQuery.isLoading}
				error={chartQuery.errorMessage}
				plotlyJson={chartQuery.plotlyJson}
			/>

			<section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_40px_-32px_rgba(15,23,42,0.6)]">
				<div className="flex w-full">
					<div className="flex w-full items-center gap-2 rounded-full bg-slate-100 p-1">
						<button
							type="button"
							onClick={() => setActiveInsightTab("report")}
							className={`flex-1 rounded-full px-4 py-1.5 text-xs font-semibold transition ${
								activeInsightTab === "report"
									? "bg-white text-slate-900 shadow-sm"
									: "text-slate-500 hover:text-slate-700"
							}`}
						>
							종목 리포트
						</button>
						<button
							type="button"
							onClick={() => setActiveInsightTab("news")}
							className={`flex-1 rounded-full px-4 py-1.5 text-xs font-semibold transition ${
								activeInsightTab === "news"
									? "bg-white text-slate-900 shadow-sm"
									: "text-slate-500 hover:text-slate-700"
							}`}
						>
							뉴스
						</button>
						<button
							type="button"
							onClick={() => setActiveInsightTab("community")}
							className={`flex-1 rounded-full px-4 py-1.5 text-xs font-semibold transition ${
								activeInsightTab === "community"
									? "bg-white text-slate-900 shadow-sm"
									: "text-slate-500 hover:text-slate-700"
							}`}
						>
							커뮤니티
						</button>
					</div>
				</div>

				{activeInsightTab === "report" && (
					<div className="mt-6 space-y-4">
						{stockReportQuery.isLoading && (
							<div className="flex justify-center py-4">
								<LoadingSpinner label="종목 리포트를 불러오는 중..." />
							</div>
						)}
						{stockReportQuery.isError && (
							<div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
								{stockReportQuery.errorMessage}
							</div>
						)}
						{!stockReportQuery.isLoading &&
							!stockReportQuery.isError &&
							!report && (
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
										<span>
											리포트 생성 시각: {formatGeneratedAt(report.generated_at)}
										</span>
									</div>
									<h4 className="mt-3 text-base font-semibold text-slate-900">
										투자 요약
									</h4>
									<p className="mt-2 text-sm leading-7 text-slate-700">
										{report.summary.investment_summary}
									</p>
									<div className="mt-4 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
										<div className="rounded-xl bg-slate-100 px-3 py-2">
											<div className="text-xs text-slate-500">현재가</div>
											<div className="font-semibold text-slate-900">
												{formatNumber(report.summary.current_price)}
											</div>
										</div>
										<div className="rounded-xl bg-slate-100 px-3 py-2">
											<div className="text-xs text-slate-500">변동률</div>
											<div className="font-semibold text-slate-900">
												{report.summary.price_change_pct}%
											</div>
										</div>
										<div className="rounded-xl bg-slate-100 px-3 py-2">
											<div className="text-xs text-slate-500">1년 수익률</div>
											<div className="font-semibold text-slate-900">
												{report.summary.return_1y}%
											</div>
										</div>
										<div className="rounded-xl bg-slate-100 px-3 py-2">
											<div className="text-xs text-slate-500">RSI</div>
											<div className="font-semibold text-slate-900">
												{report.summary.rsi}
											</div>
										</div>
									</div>
								</article>

								<article className="rounded-2xl border border-slate-200 bg-white p-5">
									<button
										type="button"
										onClick={() =>
											setOpenReportSections((prev) => ({
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
											{openReportSections.keyPoints ? "접기" : "펼치기"}
										</span>
									</button>
									{openReportSections.keyPoints && (
										<>
											<ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-slate-700">
												{report.sections.investment_summary.key_points.map(
													(point) => (
														<li key={point}>{point}</li>
													),
												)}
											</ul>
											<p className="mt-4 rounded-xl bg-slate-100 px-3 py-2 text-sm leading-7 text-slate-700">
												체크포인트:{" "}
												{report.sections.investment_summary.checkpoint}
											</p>
										</>
									)}
								</article>

								<article className="rounded-2xl border border-slate-200 bg-white p-5">
									<button
										type="button"
										onClick={() =>
											setOpenReportSections((prev) => ({
												...prev,
												valuation: !prev.valuation,
											}))
										}
										className="flex w-full items-center justify-between text-left"
									>
										<h4 className="text-sm font-semibold text-slate-900">
											밸류에이션
										</h4>
										<span className="text-xs font-semibold text-slate-500">
											{openReportSections.valuation ? "접기" : "펼치기"}
										</span>
									</button>
									{openReportSections.valuation && (
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
											setOpenReportSections((prev) => ({
												...prev,
												opinion: !prev.opinion,
											}))
										}
										className="flex w-full items-center justify-between text-left"
									>
										<h4 className="text-sm font-semibold text-slate-900">
											투자 의견
										</h4>
										<span className="text-xs font-semibold text-slate-500">
											{openReportSections.opinion ? "접기" : "펼치기"}
										</span>
									</button>
									{openReportSections.opinion && (
										<div className="mt-3 grid gap-4">
											<div>
												<div className="text-xs font-semibold text-emerald-700">
													장점
												</div>
												<ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-7 text-slate-700">
													{report.sections.investment_opinion.pros.map(
														(item) => (
															<li key={item}>{item}</li>
														),
													)}
												</ul>
											</div>
											<div>
												<div className="text-xs font-semibold text-rose-700">
													유의점
												</div>
												<ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-7 text-slate-700">
													{report.sections.investment_opinion.cons.map(
														(item) => (
															<li key={item}>{item}</li>
														),
													)}
												</ul>
											</div>
										</div>
									)}
								</article>
							</>
						)}
					</div>
				)}

				{activeInsightTab !== "report" && (
					<div className="mt-6">
						<CommunityNewsSection
							symbol={stockId}
							activeTab={activeInsightTab === "news" ? "news" : "community"}
							showContainer={false}
							showHeader={false}
						/>
					</div>
				)}
			</section>

			{isHolding && (
				<section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_40px_-32px_rgba(15,23,42,0.6)]">
					<div className="flex flex-wrap items-center justify-between gap-3">
						<h3 className="text-lg font-semibold text-slate-900">
							물타기 계산기
						</h3>
						<button
							type="button"
							onClick={() =>
								navigate(
									`/calculator/${stockId ?? ""}?name=${encodeURIComponent(
										searchParams.get("name") ?? "",
									)}`,
								)
							}
							className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-800"
						>
							계산기 열기
						</button>
					</div>
				</section>
			)}
		</div>
	);
}
