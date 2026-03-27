import { Info } from "lucide-react";
import Plotly from "plotly.js-dist-min";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import createPlotlyComponent from "react-plotly.js/factory";
import CommonModal from "@/components/CommonModal";
import LoadingSpinner from "@/components/LoadingSpinner";
import normalizePlotly, {
	type PlotlyFigure,
} from "@/lib/plotly/normalizePlotly";

const Plot = createPlotlyComponent(Plotly);

const RANGE_OPTIONS = [
	{ id: "1d", label: "하루" },
	{ id: "1m", label: "1달" },
	{ id: "3m", label: "3달" },
	{ id: "1y", label: "1년" },
] as const;

export type ChartRange = (typeof RANGE_OPTIONS)[number]["id"];

const TYPE_OPTIONS = [
	{ id: "candlestick", label: "캔들" },
	{ id: "technical", label: "기술" },
	// { id: "volume", label: "거래량" },
	{ id: "line", label: "라인" },
] as const;

export type ChartType = (typeof TYPE_OPTIONS)[number]["id"];

const CHART_TYPE_CONTENT: Record<
	ChartType,
	{
		label: string;
		summary: string;
		details: string[];
	}
> = {
	line: {
		label: "라인",
		summary:
			"하루의 최종 가격인 종가만 점으로 찍어 선으로 연결한 차트예요. 전체 흐름을 한눈에 볼 수 있어요!",
		details: [
			"장이 끝날 때의 가격인 종가만 점으로 찍어 선으로 이은 차트예요.",
			"장중의 복잡한 움직임은 덜어내고, 주가가 장기적으로 오르는지 내리는지 큰 추세를 파악할 때 가장 보기 편해요.",
		],
	},
	candlestick: {
		label: "캔들",
		summary:
			"주식에서 가장 많이 사용하는 차트로, 하루 동안 가격이 어떻게 움직였는지 시작가·종가·최고가·최저가를 양초 모양으로 보여줘요!",
		details: [
			"주식에서 가장 많이 쓰는 차트예요.",
			"빨간색 양봉은 시작할 때보다 가격이 올랐다는 뜻이고, 파란색 음봉은 내렸다는 뜻이에요.",
			"꼬리 길이를 통해 하루 동안 주가가 얼마나 크게 흔들렸는지 상세한 변동성을 알 수 있어요.",
		],
	},
	technical: {
		label: "기술",
		summary:
			"과거 데이터를 분석해서 지금이 살 때인지 팔 때인지 힌트를 주는 보조 지표 차트예요!",
		details: [
			"단순한 가격 변동을 넘어, 이동평균선이나 거래량 같은 값을 계산해 그래프로 나타낸 차트예요.",
			"지금 주식이 과열됐는지, 바닥에 가까운지 판단해 매수·매도 타이밍을 잡고 싶을 때 활용하면 좋아요.",
		],
	},
};

export type ChartPanelProps = {
	symbol: string;
	range: ChartRange;
	onRangeChange: (range: ChartRange) => void;
	type: ChartType;
	onTypeChange: (type: ChartType) => void;
	loading?: boolean;
	error?: string | null;
	plotlyJson?: unknown | null;
	isWatchlisted?: boolean;
	onToggleWatchlist?: () => void;
	watchlistAriaLabel?: string;
	showWatchlistButton?: boolean;
	watchlistDisabled?: boolean;
	footer?: ReactNode;
};

export default function ChartPanel({
	symbol,
	range,
	onRangeChange,
	type,
	onTypeChange,
	loading = false,
	error = null,
	plotlyJson = null,
	isWatchlisted = false,
	onToggleWatchlist,
	watchlistAriaLabel = "관심 종목 추가",
	showWatchlistButton = false,
	watchlistDisabled = false,
	footer,
}: ChartPanelProps) {
	const rangeLabel = useMemo(
		() => RANGE_OPTIONS.find((option) => option.id === range)?.label ?? "",
		[range],
	);
	const chartTypeContent = CHART_TYPE_CONTENT[type];

	return (
		<section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_40px_-32px_rgba(15,23,42,0.6)]">
			<header className="flex flex-col gap-4">
				<div className="flex items-center justify-between gap-3">
					<div>
						<p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
							Selected
						</p>
						<h2 className="text-2xl font-semibold text-slate-900">
							{symbol} 차트
						</h2>
						<p className="text-sm text-slate-500">{rangeLabel} 기준</p>
					</div>
					{(showWatchlistButton || onToggleWatchlist) && (
						<button
							type="button"
							onClick={onToggleWatchlist}
							disabled={watchlistDisabled}
							aria-label={watchlistAriaLabel}
							className={
								"shrink-0 rounded-full border mr-2 border-slate-200 bg-white p-2 transition disabled:cursor-not-allowed disabled:opacity-40 " +
								(isWatchlisted
									? "text-rose-500"
									: "text-slate-500 hover:text-rose-500")
							}
						>
							<svg
								viewBox="0 0 24 24"
								fill={isWatchlisted ? "currentColor" : "none"}
								stroke="currentColor"
								strokeWidth="1.8"
								className="h-5 w-5"
								aria-hidden="true"
							>
								<path d="M12 21s-6.7-4.35-9.33-8.09C.8 10.22 1.19 6.2 4.12 4.44c2.01-1.21 4.54-.76 6.22 1.02L12 7.2l1.66-1.74c1.68-1.78 4.21-2.23 6.22-1.02 2.93 1.76 3.32 5.78 1.45 8.47C18.7 16.65 12 21 12 21z" />
							</svg>
						</button>
					)}
				</div>
				<div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-1.5">
					<TypeSelect value={type} onChange={onTypeChange} />
					<RangeTabs value={range} onChange={onRangeChange} />
				</div>
				<ChartTypeGuide content={chartTypeContent} />
			</header>

			<div className="mt-6">
				<ChartRenderer
					loading={loading}
					error={error}
					plotlyJson={plotlyJson}
					chartType={type}
				/>
			</div>

			{footer ? <div className="mt-6">{footer}</div> : null}
		</section>
	);
}

type ChartTypeGuideProps = {
	content: {
		label: string;
		summary: string;
		details: string[];
	};
};

function ChartTypeGuide({ content }: ChartTypeGuideProps) {
	const [open, setOpen] = useState(false);

	return (
		<>
			<div className="rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2">
				<p className="text-xs leading-5 text-slate-600">
					<span className="mr-1 font-semibold text-slate-900">
						{content.label}
					</span>
					{content.summary}
					<button
						type="button"
						onClick={() => setOpen(true)}
						aria-label={`${content.label} 차트 상세 설명 보기`}
						className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full align-top text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
					>
						<Info className="h-3 w-3" />
					</button>
				</p>
			</div>

			<CommonModal
				open={open}
				onClose={() => setOpen(false)}
				title={`${content.label} 차트란?`}
				actionLabel="확인"
				onAction={() => setOpen(false)}
				icon={<Info className="h-6 w-6 text-sky-600" />}
				className="max-w-lg text-left"
			>
				<div className="relative mt-6 space-y-3 text-left">
					{content.details.map((detail, index) => (
						<div
							key={detail}
							className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
						>
							<div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
								{index + 1}
							</div>
							<p className="pt-0.5 text-sm leading-6 text-slate-700">
								{detail}
							</p>
						</div>
					))}
				</div>
			</CommonModal>
		</>
	);
}

type RangeTabsProps = {
	value: ChartRange;
	onChange: (range: ChartRange) => void;
};

function RangeTabs({ value, onChange }: RangeTabsProps) {
	return (
		<div className="ml-auto flex items-center gap-1 rounded-full bg-white p-0.5">
			{RANGE_OPTIONS.map((option) => {
				const isActive = option.id === value;
				return (
					<button
						key={option.id}
						type="button"
						className={
							"rounded-full px-3 py-1.5 text-xs font-semibold tabular-nums tracking-tight transition-colors " +
							(isActive
								? "bg-slate-900 text-white shadow-[0_3px_8px_-6px_rgba(15,23,42,0.8)]"
								: "text-slate-500 hover:text-slate-900")
						}
						onClick={() => onChange(option.id)}
					>
						{option.label}
					</button>
				);
			})}
		</div>
	);
}

type TypeSelectProps = {
	value: ChartType;
	onChange: (type: ChartType) => void;
};

function TypeSelect({ value, onChange }: TypeSelectProps) {
	const [open, setOpen] = useState(false);
	const rootRef = useRef<HTMLDivElement>(null);
	const selected = TYPE_OPTIONS.find((option) => option.id === value);

	useEffect(() => {
		const handleOutsideClick = (event: MouseEvent) => {
			if (!rootRef.current?.contains(event.target as Node)) {
				setOpen(false);
			}
		};

		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				setOpen(false);
			}
		};

		window.addEventListener("mousedown", handleOutsideClick);
		window.addEventListener("keydown", handleEscape);
		return () => {
			window.removeEventListener("mousedown", handleOutsideClick);
			window.removeEventListener("keydown", handleEscape);
		};
	}, []);

	return (
		<div ref={rootRef} className="relative">
			<button
				type="button"
				aria-haspopup="listbox"
				aria-expanded={open}
				className="flex h-8 w-20 items-center justify-between rounded-full border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition-colors hover:text-slate-900"
				onClick={() => setOpen((prev) => !prev)}
			>
				<span>{selected?.label ?? "차트 유형"}</span>
				<span
					className={
						"text-[10px] text-slate-400 transition-transform " +
						(open ? "rotate-180" : "")
					}
				>
					▼
				</span>
			</button>
			{open && (
				<div className="absolute left-0 top-[calc(100%+6px)] z-20 w-full rounded-xl border border-slate-200 bg-white p-1 shadow-[0_10px_24px_-16px_rgba(15,23,42,0.55)]">
					<div role="listbox" className="space-y-0.5">
						{TYPE_OPTIONS.map((option) => {
							const isSelected = option.id === value;
							return (
								<button
									key={option.id}
									type="button"
									role="option"
									aria-selected={isSelected}
									className={
										"flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-sm font-medium transition-colors " +
										(isSelected
											? "bg-slate-100 text-slate-900"
											: "text-slate-600 hover:bg-slate-100 hover:text-slate-900")
									}
									onClick={() => {
										onChange(option.id);
										setOpen(false);
									}}
								>
									<span className="w-3 text-xs text-slate-700">
										{isSelected ? "✓" : ""}
									</span>
									<span>{option.label}</span>
								</button>
							);
						})}
					</div>
				</div>
			)}
		</div>
	);
}

type ChartRendererProps = {
	loading: boolean;
	error: string | null;
	plotlyJson: unknown | null;
	chartType: ChartType;
};

function ChartRenderer({
	loading,
	error,
	plotlyJson,
	chartType,
}: ChartRendererProps) {
	if (loading) {
		return (
			<div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50">
				<LoadingSpinner label="차트 로딩 중..." />
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex h-64 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-rose-200 bg-rose-50">
				<p className="text-sm font-semibold text-rose-500">
					차트를 불러오지 못했습니다.
				</p>
				<p className="text-xs text-rose-400">{error}</p>
				<button
					type="button"
					className="rounded-full border border-rose-200 bg-white px-4 py-2 text-xs font-semibold text-rose-500"
				>
					다시 시도
				</button>
			</div>
		);
	}

	if (!plotlyJson) {
		return (
			<div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50">
				<p className="text-sm text-slate-400">표시할 데이터가 없습니다.</p>
			</div>
		);
	}

	const parsedPlotly =
		typeof plotlyJson === "string"
			? safeParsePlotly(plotlyJson)
			: (plotlyJson as PlotlyFigure | null);

	if (!parsedPlotly?.data) {
		return (
			<div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50">
				<p className="text-sm text-slate-400">
					Plotly 데이터를 해석할 수 없습니다.
				</p>
			</div>
		);
	}

	const normalizedPlotly = normalizePlotly(parsedPlotly, {
		chartType,
	});

	return (
		<div className="rounded-2xl border border-slate-200 bg-white">
			{chartType === "candlestick" && (
				<div className="legend ml-3 mt-2 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
					<span>이동평균선</span>
					<span style={{ color: "#FF9500" }}>5</span>
					<span style={{ color: "#34C759" }}>20</span>
					<span style={{ color: "#AF52DE" }}>60</span>
				</div>
			)}
			<div className="w-full p-1">
				<Plot
					data={normalizedPlotly.data}
					layout={{
						...(normalizedPlotly.layout ?? {}),
						autosize: true,
						margin: {
							...((normalizedPlotly.layout?.margin ?? {}) as Record<
								string,
								unknown
							>),
						},
					}}
					config={{ responsive: true, displayModeBar: false }}
					useResizeHandler
					style={{ width: "100%" }}
				/>
			</div>
		</div>
	);
}

function safeParsePlotly(value: string) {
	try {
		return JSON.parse(value) as {
			data?: unknown[];
			layout?: Record<string, unknown>;
		};
	} catch {
		return null;
	}
}
