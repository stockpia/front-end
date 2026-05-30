import { BriefcaseBusiness, House, LineChart, UserRound } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
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

export default function BottomNavigation() {
	const { pathname } = useLocation();
	const accountSession = useAccountSession();
	const userId = accountSession?.userId;

	const resolvePath = (path: string) => {
		if (path !== "/trades") {
			return path;
		}

		return userId ? `/trades/${userId}` : "/login";
	};

	return (
		<nav
			aria-label="하단 내비게이션"
			className="fixed right-0 bottom-0 left-0 z-40 border-t border-slate-200 bg-white/95 px-3 pt-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] shadow-[0_-18px_50px_-38px_rgba(15,23,42,0.75)] backdrop-blur"
		>
			<div className="mx-auto grid w-full max-w-120 grid-cols-4 gap-1">
				{navItems.map((item) => {
					const Icon = item.icon;
					const isActive = item.match(pathname);

					return (
						<Link
							key={item.label}
							to={resolvePath(item.path)}
							aria-current={isActive ? "page" : undefined}
							className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl px-2 text-xs font-bold transition ${
								isActive
									? "bg-slate-950 text-white shadow-[0_10px_30px_-20px_rgba(15,23,42,0.8)]"
									: "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
							}`}
						>
							<Icon className="h-5 w-5" />
							<span>{item.label}</span>
						</Link>
					);
				})}
			</div>
		</nav>
	);
}
