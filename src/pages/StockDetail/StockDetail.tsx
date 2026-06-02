import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import ChartPanel, {
	type ChartMinuteInterval,
	type ChartRange,
	type ChartType,
} from "@/components/ChartPanel";
import StockTickerSummary from "@/components/StockTickerSummary";
import { useStockChartQuery } from "@/hooks/queries/useStockChartQuery";
import { useStockReportQuery } from "@/hooks/queries/useStockCommunityNewsQueries";
import { useStockTickerSocket } from "@/hooks/useStockTickerSocket";
import {
	getInvestmentProfile,
	investmentProfileResults,
	subscribeInvestmentProfile,
} from "@/lib/investmentProfile";
import CommunityNewsSection from "@/pages/StockDetail/views/CommunityNewsSection";
import StockReportSection from "@/pages/StockDetail/views/StockReportSection";

const PROFILE_TONE_TOGGLE_KEY = "stockpia.profile-tone-enabled";

function readProfileToneEnabled(): boolean {
	if (typeof window === "undefined") return true;
	const raw = window.localStorage.getItem(PROFILE_TONE_TOGGLE_KEY);
	// 기본값은 ON (사용자가 명시적으로 끄지 않은 한 성향 반영)
	return raw !== "0";
}

function writeProfileToneEnabled(enabled: boolean) {
	if (typeof window === "undefined") return;
	window.localStorage.setItem(PROFILE_TONE_TOGGLE_KEY, enabled ? "1" : "0");
}

type StockInsightTab = "report" | "news" | "community";

export default function StockDetail() {
	const navigate = useNavigate();
	const { stockId } = useParams();
	const [searchParams] = useSearchParams();
	const [range, setRange] = useState<ChartRange>("1d");
	const [chartType, setChartType] = useState<ChartType>("candlestick");
	const [minuteInterval, setMinuteInterval] = useState<ChartMinuteInterval>(10);
	const [activeInsightTab, setActiveInsightTab] =
		useState<StockInsightTab>("report");

	// 사용자 투자성향 (localStorage). 미설정이면 백엔드에서 default 3 (위험중립형) 사용.
	const [profileLevel, setProfileLevel] = useState<
		1 | 2 | 3 | 4 | 5 | undefined
	>(() => getInvestmentProfile()?.result.level);
	useEffect(() => {
		return subscribeInvestmentProfile(() => {
			setProfileLevel(getInvestmentProfile()?.result.level);
		});
	}, []);

	// 사용자가 명시적으로 끄면 기본 톤 (level=3) 으로. 켜면 본인 성향 반영.
	const [profileToneEnabled, setProfileToneEnabled] = useState<boolean>(() =>
		readProfileToneEnabled(),
	);
	const effectiveProfileLevel = profileToneEnabled ? profileLevel : undefined;
	const profileMeta = useMemo(() => {
		if (!profileLevel) return null;
		return (
			investmentProfileResults.find((p) => p.level === profileLevel) ?? null
		);
	}, [profileLevel]);

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
		interval: range === "1d" ? minuteInterval : undefined,
	});
	const stockReportQuery = useStockReportQuery({
		symbol: stockId,
		enabled: activeInsightTab === "report",
		profileLevel: effectiveProfileLevel,
	});
	const stockTickerSocket = useStockTickerSocket(stockId);

	const report = stockReportQuery.report;
	const realtimeReport = useMemo(() => {
		if (!report || !stockTickerSocket.ticker) {
			return report;
		}

		return {
			...report,
			summary: {
				...report.summary,
				current_price: stockTickerSocket.ticker.price,
				price_change_pct: stockTickerSocket.ticker.change_rate,
			},
		};
	}, [report, stockTickerSocket.ticker]);

	useEffect(() => {
		if (activeInsightTab !== "report") {
			return;
		}

		if (report) {
			console.log("[StockDetail] stock report response:", report);
		}

		if (stockReportQuery.error) {
			console.error(
				"[StockDetail] stock report error:",
				stockReportQuery.error,
			);
		}
	}, [activeInsightTab, report, stockReportQuery.error]);

	return (
		<div className="space-y-8 py-8">
			<ChartPanel
				symbol={symbolLabel}
				range={range}
				onRangeChange={setRange}
				type={chartType}
				onTypeChange={setChartType}
				minuteInterval={minuteInterval}
				onMinuteIntervalChange={setMinuteInterval}
				loading={chartQuery.isLoading}
				error={chartQuery.errorMessage}
				plotlyJson={chartQuery.plotlyJson}
				marketStatus={chartQuery.marketStatus}
				footer={
					<StockTickerSummary
						ticker={stockTickerSocket.ticker}
						fallbackPrice={realtimeReport?.summary.current_price}
						fallbackChangeRate={realtimeReport?.summary.price_change_pct}
						errorMessage={stockTickerSocket.errorMessage}
						isConnected={stockTickerSocket.isConnected}
					/>
				}
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
					<>
						<ProfileToneToggle
							profileMeta={profileMeta}
							enabled={profileToneEnabled}
							onToggle={(next) => {
								setProfileToneEnabled(next);
								writeProfileToneEnabled(next);
							}}
						/>
						<StockReportSection
							isLoading={stockReportQuery.isLoading}
							isError={stockReportQuery.isError}
							errorMessage={stockReportQuery.errorMessage}
							report={realtimeReport}
						/>
					</>
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

type ProfileMeta = (typeof investmentProfileResults)[number];

type ProfileToneToggleProps = {
	profileMeta: ProfileMeta | null;
	enabled: boolean;
	onToggle: (enabled: boolean) => void;
};

/**
 * 종목 리포트의 LLM 톤이 본인 투자 성향에 맞춰진다는 걸 사용자가 명시적으로
 * 인지하고 끄고 켤 수 있도록 하는 토글.
 *
 * - 성향 미설정: 설정 페이지로 CTA
 * - 성향 설정됨: 성향명 + On/Off 토글 (Off 면 백엔드 default 톤=위험중립형)
 */
function ProfileToneToggle({
	profileMeta,
	enabled,
	onToggle,
}: ProfileToneToggleProps) {
	if (!profileMeta) {
		return (
			<div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3">
				<div className="min-w-0">
					<p className="text-sm font-semibold text-slate-700">
						투자 성향이 반영된 리포트
					</p>
					<p className="mt-0.5 text-xs text-slate-500">
						성향을 설정하면 리포트 톤이 내 스타일에 맞춰져요.
					</p>
				</div>
				<Link
					to="/mypage/investment-profile"
					className="shrink-0 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white"
				>
					설정하기
				</Link>
			</div>
		);
	}

	return (
		<div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
			<div className="min-w-0">
				<p className="text-sm font-semibold text-slate-900">
					내 투자 성향 반영{" "}
					<span className="text-slate-500">— {profileMeta.name}</span>
				</p>
				<p className="mt-0.5 text-xs text-slate-500">
					{enabled
						? "리포트 톤이 내 성향에 맞춰 생성됩니다."
						: "기본 톤(위험중립형) 으로 생성됩니다."}
				</p>
			</div>
			<button
				type="button"
				role="switch"
				aria-checked={enabled}
				onClick={() => onToggle(!enabled)}
				className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${
					enabled ? "bg-emerald-500" : "bg-slate-300"
				}`}
			>
				<span
					className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
						enabled ? "translate-x-5" : "translate-x-0.5"
					}`}
				/>
			</button>
		</div>
	);
}
