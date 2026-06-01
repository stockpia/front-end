import { useQuery } from "@tanstack/react-query";
import { fetchStockChart, type StockChartInterval } from "@/lib/api/stocks/chart";
import type { StockChartRange, StockChartType } from "@/types/stocks";

type UseStockChartQueryParams = {
	symbol?: string | null;
	range: StockChartRange;
	type: StockChartType;
	enabled?: boolean;
	interval?: StockChartInterval;
};

export function stockChartQueryKey(
	symbol: string | null | undefined,
	range: StockChartRange,
	type: StockChartType,
	interval?: StockChartInterval,
) {
	// interval 은 range='1d' 일 때만 cache key 차원에 포함
	return [
		"stock-chart",
		symbol ?? null,
		range,
		type,
		range === "1d" ? (interval ?? "auto") : "n/a",
	] as const;
}

export function useStockChartQuery({
	symbol,
	range,
	type,
	enabled = true,
	interval,
}: UseStockChartQueryParams) {
	const query = useQuery({
		queryKey: stockChartQueryKey(symbol, range, type, interval),
		enabled: Boolean(symbol) && enabled,
		queryFn: ({ signal }) =>
			fetchStockChart(symbol as string, { range, type, interval }, signal),
	});

	const errorMessage =
		query.error instanceof Error
			? query.error.message
			: query.error
				? "알 수 없는 오류가 발생했습니다."
				: null;

	return {
		...query,
		errorMessage,
		plotlyJson: query.data?.plotly ?? null,
		marketStatus: query.data?.market_status,
		marketCloseKst: query.data?.market_close_kst,
	};
}
