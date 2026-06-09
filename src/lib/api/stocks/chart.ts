import { api } from "@/lib/api/axios";
import type {
	StockChartRange,
	StockChartResponse,
	StockChartType,
} from "@/types/stocks";

export async function fetchStockChart(
	symbol: string,
	params: {
		range: StockChartRange;
		type: StockChartType;
	},
	signal?: AbortSignal,
) {
	const { data } = await api.get<StockChartResponse>(
		`/web/stocks/${symbol}/chart`,
		{
			params,
			signal,
		},
	);
	return data;
}
