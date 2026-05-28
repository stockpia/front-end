import { useQuery } from "@tanstack/react-query";
import { getUserDetail } from "@/lib/api/accounts";

function toErrorMessage(error: unknown) {
	if (error instanceof Error) return error.message;
	return error ? "사용자 정보를 불러오지 못했어요." : null;
}

/**
 * GET /web/users/{userId}/ 응답 hook.
 * MyPage 의 KIS / Telegram 연동 뱃지 + 카드가 이 응답을 공유.
 */
export function useUserDetailQuery(userId: string | null) {
	const query = useQuery({
		queryKey: ["user-detail", userId],
		enabled: Boolean(userId),
		queryFn: ({ signal }) => getUserDetail(userId as string, signal),
	});

	return {
		...query,
		errorMessage: toErrorMessage(query.error),
		user: query.data ?? null,
	};
}
