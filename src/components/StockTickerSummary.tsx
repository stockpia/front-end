import type { StockTickerUpdate } from "@/hooks/useStockTickerSocket";

type StockTickerSummaryProps = {
	ticker: StockTickerUpdate | null;
	fallbackPrice?: number;
	fallbackChangeRate?: number;
	errorMessage?: string | null;
	isConnected?: boolean;
};

function formatPrice(value?: number) {
	if (typeof value !== "number" || Number.isNaN(value)) {
		return "-";
	}
	return `${value.toLocaleString("ko-KR")}원`;
}

function formatSignedNumber(value?: number) {
	if (typeof value !== "number" || Number.isNaN(value)) {
		return "-";
	}
	return `${value > 0 ? "+" : ""}${value.toLocaleString("ko-KR")}원`;
}

function formatSignedRate(value?: number) {
	if (typeof value !== "number" || Number.isNaN(value)) {
		return "-";
	}
	return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
}

export default function StockTickerSummary({
	ticker,
	fallbackPrice,
	fallbackChangeRate,
	errorMessage,
	isConnected = false,
}: StockTickerSummaryProps) {
	const changeRate = ticker?.change_rate ?? fallbackChangeRate;
	const isPositive = (changeRate ?? 0) >= 0;

	return (
		<section className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<p className="text-xs font-semibold text-slate-500">실시간 시세</p>
					<p className="mt-1 text-xl font-semibold text-slate-900">
						{formatPrice(ticker?.price ?? fallbackPrice)}
					</p>
				</div>
				<div className="text-right">
					<p
						className={
							"text-sm font-semibold " +
							(isPositive ? "text-rose-500" : "text-blue-500")
						}
					>
						{formatSignedNumber(ticker?.change)}
					</p>
					<p
						className={
							"text-sm font-semibold " +
							(isPositive ? "text-rose-500" : "text-blue-500")
						}
					>
						{formatSignedRate(changeRate)}
					</p>
				</div>
			</div>
			<p className="mt-2 text-xs text-slate-400">
				{errorMessage
					? errorMessage
					: isConnected
						? "실시간 연결됨"
						: "실시간 연결 대기 중"}
			</p>
		</section>
	);
}
