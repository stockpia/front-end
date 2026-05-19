import { useQuery } from "@tanstack/react-query";
import { fetchTradeDetail } from "@/lib/api/stocks/detail";
import type { TradePeriod } from "@/mocks/tradeDetail";

type UseTradeDetailQueryParams = {
	symbol?: string | null;
	userId?: string;
	period: TradePeriod;
	enabled?: boolean;
};

function toErrorMessage(error: unknown) {
	if (error instanceof Error) {
		return error.message;
	}
	return error ? "알 수 없는 오류가 발생했습니다." : null;
}

export function tradeDetailQueryKey(
	symbol: string | null | undefined,
	userId: string | undefined,
	period: TradePeriod,
) {
	return ["trade-detail", symbol ?? null, userId ?? "default_user", period] as const;
}

export function useTradeDetailQuery({
	symbol,
	userId = "default_user",
	period,
	enabled = true,
}: UseTradeDetailQueryParams) {
	const query = useQuery({
		queryKey: tradeDetailQueryKey(symbol, userId, period),
		enabled: Boolean(symbol) && enabled,
		queryFn: ({ signal }) =>
			fetchTradeDetail(symbol as string, { user_id: userId, period }, signal),
	});

	return {
		...query,
		errorMessage: toErrorMessage(query.error),
		report: query.data ?? null,
	};
}
