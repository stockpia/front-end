import { api } from "@/lib/api/axios";
import type {
	StockCommunityLatestResponse,
	StockCommunityResponse,
	StockNewsResponse,
	StockReportResponse,
} from "@/types/stockCommunityNews";

export async function fetchStockNews(
	symbol: string,
	params?: { cursor?: string; limit?: number },
	signal?: AbortSignal,
) {
	const { data } = await api.get<StockNewsResponse>(
		`/web/stocks/${symbol}/news`,
		{
			params,
			signal,
		},
	);
	return data;
}

export async function fetchStockCommunity(
	symbol: string,
	params?: { cursor?: string; limit?: number },
	signal?: AbortSignal,
) {
	const { data } = await api.get<StockCommunityResponse>(
		`/web/stocks/${symbol}/community`,
		{
			params,
			signal,
		},
	);
	return data;
}

export async function fetchStockCommunityLatest(
	symbol: string,
	params: { since: string },
	signal?: AbortSignal,
) {
	const { data } = await api.get<StockCommunityLatestResponse>(
		`/web/stocks/${symbol}/community/latest`,
		{
			params,
			signal,
		},
	);
	return data;
}

export async function fetchStockReport(symbol: string, signal?: AbortSignal) {
	const { data } = await api.get<StockReportResponse>(
		`/web/stocks/${symbol}/report`,
		{
			signal,
		},
	);
	return data;
}
