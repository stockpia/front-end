import { api } from "@/lib/api/axios";
import type { TradeDetailResponse, TradePeriod } from "@/types/tradeDetail";

type TradeDetailErrorResponse = {
	error?: string;
	message?: string;
};

export type FetchTradeDetailParams = {
	user_id?: string;
	period?: TradePeriod;
};

function toTradeDetailResponse(data: unknown): TradeDetailResponse {
	if (!data || typeof data !== "object") {
		throw new Error("거래내역 리포트 응답 형식이 올바르지 않습니다.");
	}

	const errorResponse = data as TradeDetailErrorResponse;
	if (errorResponse.error) {
		throw new Error(errorResponse.message ?? errorResponse.error);
	}

	return data as TradeDetailResponse;
}

export async function fetchTradeDetail(
	symbol: string,
	params: FetchTradeDetailParams,
	signal?: AbortSignal,
) {
	const queryParams: Record<string, string> = {};
	if (params.user_id) queryParams.user_id = params.user_id;
	if (params.period) queryParams.period = params.period;

	const { data } = await api.get<unknown>(
		`/web/stocks/${encodeURIComponent(symbol)}/detail`,
		{
			params: queryParams,
			signal,
		},
	);
	return toTradeDetailResponse(data);
}
