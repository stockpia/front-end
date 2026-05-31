import { api } from "@/lib/api/axios";
import type {
	StockChartRange,
	StockChartResponse,
	StockChartType,
} from "@/types/stocks";

export type StockChartInterval = 1 | 5 | 10 | 15 | 30 | 60;

export async function fetchStockChart(
	symbol: string,
	params: {
		range: StockChartRange;
		type: StockChartType;
		interval?: StockChartInterval;
	},
	signal?: AbortSignal,
) {
	const { interval, ...rest } = params;
	const queryParams: Record<string, string | number> = { ...rest };
	// interval 은 range='1d' 일 때만 의미 — 다른 range 에선 백엔드가 무시
	if (interval && rest.range === "1d") queryParams.interval = interval;

	const { data } = await api.get<StockChartResponse>(
		`/web/stocks/${symbol}/chart`,
		{
			params: queryParams,
			signal,
		},
	);
	return data;
}
