import { useQuery } from "@tanstack/react-query";
import { fetchStocksSearch } from "@/lib/api/stocks/search";

function toErrorMessage(error: unknown) {
	if (error instanceof Error) {
		return error.message;
	}
	return error ? "알 수 없는 오류가 발생했습니다." : null;
}

type UseStocksSearchQueryParams = {
	query: string;
	limit?: number;
	enabled?: boolean;
};

/**
 * 종목 검색 (네이버 금융 기반).
 * /stocks/list 가 KIS 랭킹 top 30 만 반환하는 한계를
 * 전체 KOSPI/KOSDAQ 부분 일치 검색으로 보완.
 */
export function useStocksSearchQuery({
	query,
	limit = 20,
	enabled = true,
}: UseStocksSearchQueryParams) {
	const trimmed = query.trim();
	const result = useQuery({
		queryKey: ["stocks-search", trimmed, limit],
		enabled: enabled && trimmed.length > 0,
		queryFn: ({ signal }) => fetchStocksSearch(trimmed, limit, signal),
		staleTime: 60 * 60 * 1000, // 1h — 백엔드에서도 1h 캐시
	});

	return {
		...result,
		errorMessage: toErrorMessage(result.error),
		stocks: result.data?.stocks ?? [],
	};
}
