import {
	BriefcaseBusiness,
	House,
	LineChart,
	UserRound,
	X,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import CommonModal from "@/components/CommonModal";
import { useAccountSession } from "@/hooks/useAccountSession";

const navItems = [
	{
		label: "홈",
		path: "/",
		match: (pathname: string) => pathname === "/",
		icon: House,
	},
	{
		label: "종목",
		path: "/stocks",
		match: (pathname: string) =>
			pathname === "/stocks" ||
			pathname.startsWith("/stocks/") ||
			pathname.startsWith("/calculator/"),
		icon: LineChart,
	},
	{
		label: "내 거래",
		path: "/trades",
		match: (pathname: string) => pathname.startsWith("/trades"),
		icon: BriefcaseBusiness,
	},
	{
		label: "설정",
		path: "/mypage",
		match: (pathname: string) => pathname.startsWith("/mypage"),
		icon: UserRound,
	},
];

type LoginModalType = "trades" | "mypage";

export default function BottomNavigation() {
	const { pathname } = useLocation();
	const navigate = useNavigate();
	const accountSession = useAccountSession();
	const userId = accountSession?.userId;
	const [loginModalType, setLoginModalType] = useState<LoginModalType | null>(
		null,
	);
	const loginModalContent =
		loginModalType === "mypage"
			? {
					title: "로그인 후 설정 관리",
					description: "계좌와 알림 설정을\n마이페이지에서 관리할 수 있어요.",
					icon: <UserRound className="h-7 w-7 text-slate-900" />,
				}
			: {
					title: "로그인 후 거래 내역 확인",
					description: "로그인 + KIS 연동 후\n내 거래 내역 리포트를 볼 수 있어요.",
					icon: <BriefcaseBusiness className="h-7 w-7 text-slate-900" />,
				};

	return (
		<>
			<nav
				aria-label="하단 내비게이션"
				className="fixed right-0 bottom-0 left-0 z-40 border-t border-slate-200 bg-white/95 px-3 pt-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] shadow-[0_-18px_50px_-38px_rgba(15,23,42,0.75)] backdrop-blur"
			>
				<div className="mx-auto grid w-full max-w-120 grid-cols-4 gap-1">
					{navItems.map((item) => {
						const Icon = item.icon;
						const isActive = item.match(pathname);
						const className = `flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl px-2 text-xs font-bold transition ${
							isActive
								? "bg-slate-950 text-white shadow-[0_10px_30px_-20px_rgba(15,23,42,0.8)]"
								: "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
						}`;

						if (
							(item.path === "/trades" || item.path === "/mypage") &&
							!userId
						) {
							return (
								<button
									key={item.label}
									type="button"
									onClick={() =>
										setLoginModalType(
											item.path === "/trades" ? "trades" : "mypage",
										)
									}
									aria-current={isActive ? "page" : undefined}
									className={className}
								>
									<Icon className="h-5 w-5" />
									<span>{item.label}</span>
								</button>
							);
						}

						return (
							<Link
								key={item.label}
								to={item.path === "/trades" ? `/trades/${userId}` : item.path}
								aria-current={isActive ? "page" : undefined}
								className={className}
							>
								<Icon className="h-5 w-5" />
								<span>{item.label}</span>
							</Link>
						);
					})}
				</div>
			</nav>

			<CommonModal
				open={Boolean(loginModalType)}
				onClose={() => setLoginModalType(null)}
				title={loginModalContent.title}
				description={loginModalContent.description}
				actionLabel="로그인"
				onAction={() => {
					setLoginModalType(null);
					navigate("/login");
				}}
				icon={loginModalContent.icon}
				className="mx-3 p-6"
			>
				<button
					type="button"
					onClick={() => setLoginModalType(null)}
					aria-label="팝업 닫기"
					className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
				>
					<X className="h-4 w-4" />
				</button>
			</CommonModal>
		</>
	);
}
