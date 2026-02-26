import { useQuery } from "@tanstack/react-query";
import { fetchStockChart } from "@/lib/api/stocks/chart";
import type { StockChartRange, StockChartType } from "@/types/stocks";

type UseStockChartQueryParams = {
	symbol?: string | null;
	range: StockChartRange;
	type: StockChartType;
	enabled?: boolean;
};

export function stockChartQueryKey(
	symbol: string | null | undefined,
	range: StockChartRange,
	type: StockChartType,
) {
	return ["stock-chart", symbol ?? null, range, type] as const;
}

export function useStockChartQuery({
	symbol,
	range,
	type,
	enabled = true,
}: UseStockChartQueryParams) {
	const query = useQuery({
		queryKey: stockChartQueryKey(symbol, range, type),
		enabled: Boolean(symbol) && enabled,
		queryFn: ({ signal }) =>
			fetchStockChart(symbol as string, { range, type }, signal),
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
	};
}
