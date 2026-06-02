import { Link } from "react-router-dom";
import { useUserDetailQuery } from "@/hooks/queries/useUserDetailQuery";
import { useAccountSession } from "@/hooks/useAccountSession";

/**
 * 계좌/연동 상태 안내 배너 — 페이지 상단 공용.
 *
 * 4 상태 정확히 분리:
 *   - 비로그인 → 로그인 권유
 *   - 로그인 + KIS 미연동 → KIS 연동 권유 (시세/뉴스/리포트는 그대로 사용 가능 안내)
 *   - 로그인 + KIS 연동 → 계좌번호 표시
 *   - (로드 중) → "확인 중..."
 *
 * 정보 출처는 useUserDetailQuery 의 kis_connected boolean (서버가 단일 SoT).
 */
export default function KisStatusBanner() {
	const accountSession = useAccountSession();
	const userId = accountSession?.userId ?? null;
	const isSignedIn = Boolean(userId);

	const userDetailQuery = useUserDetailQuery(userId);
	const userDetail = userDetailQuery.user;

	// 비로그인
	if (!isSignedIn) {
		return (
			<div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
				<div className="min-w-0">
					<p className="text-sm font-semibold text-slate-900">
						로그인하면 맞춤 데이터를 볼 수 있어요
					</p>
					<p className="mt-1 text-xs text-slate-500">
						시세·뉴스·리포트는 로그인 없이도 사용 가능합니다.
					</p>
				</div>
				<Link
					to="/login"
					className="shrink-0 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
				>
					로그인
				</Link>
			</div>
		);
	}

	// 로드 중
	if (userDetailQuery.isLoading) {
		return (
			<div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
				<p className="text-sm text-slate-500">계정 정보 확인 중...</p>
			</div>
		);
	}

	// 로그인 + KIS 연동
	if (userDetail?.kis_connected) {
		return (
			<div className="flex items-center justify-between gap-4 rounded-2xl border border-emerald-100 bg-emerald-50/40 px-4 py-3">
				<div className="min-w-0">
					<p className="text-sm font-semibold text-emerald-900">
						{userDetail.name ?? accountSession?.name}님 KIS 계좌가 연동되어 있어요
					</p>
					<p className="mt-1 text-xs text-emerald-800/80">
						{userDetail.kis_account_number ?? "계좌번호 확인 중"}
						{userDetail.kis_env && (
							<span className="ml-2 rounded-full bg-white/60 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
								{userDetail.kis_env === "prod" ? "실전" : "모의"}
							</span>
						)}
					</p>
				</div>
				<Link
					to="/mypage"
					className="shrink-0 rounded-xl border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700"
				>
					마이페이지
				</Link>
			</div>
		);
	}

	// 로그인 + KIS 미연동
	return (
		<div className="flex items-center justify-between gap-4 rounded-2xl border border-amber-100 bg-amber-50/60 px-4 py-3">
			<div className="min-w-0">
				<p className="text-sm font-semibold text-amber-900">
					KIS 계좌 미연동 — 시세·뉴스·리포트는 그대로 사용 가능해요
				</p>
				<p className="mt-1 text-xs text-amber-800/80">
					보유 종목·매매 기능을 보려면 마이페이지에서 KIS 계좌를 연동해 주세요.
				</p>
			</div>
			<Link
				to="/mypage"
				className="shrink-0 rounded-xl bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white"
			>
				연동하기
			</Link>
		</div>
	);
}
