import { Menu } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAccountSession } from "@/hooks/useAccountSession";
import { clearAccountSession } from "@/lib/auth/session";
import { queryClient } from "@/lib/query/queryClient";

export default function AccountMenuButton() {
	const accountSession = useAccountSession();
	const navigate = useNavigate();
	const [isOpen, setIsOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement | null>(null);
	const isSignedIn = Boolean(accountSession?.userId);

	useEffect(() => {
		if (!isOpen) {
			return;
		}

		const handleClick = (event: MouseEvent) => {
			if (
				menuRef.current &&
				event.target instanceof Node &&
				menuRef.current.contains(event.target)
			) {
				return;
			}
			setIsOpen(false);
		};

		window.addEventListener("click", handleClick);
		return () => window.removeEventListener("click", handleClick);
	}, [isOpen]);

	const handleSignout = async () => {
		setIsOpen(false);
		clearAccountSession();
		await queryClient.invalidateQueries();
		navigate("/stocks");
	};

	if (!isSignedIn) {
		return (
			<button
				type="button"
				onClick={() => navigate("/login")}
				className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
			>
				로그인
			</button>
		);
	}

	return (
		<div ref={menuRef} className="relative">
			<button
				type="button"
				onClick={() => setIsOpen((prev) => !prev)}
				aria-label="계정 메뉴 열기"
				aria-expanded={isOpen}
				className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
			>
				<Menu className="h-4 w-4" />
			</button>
			{isOpen && (
				<div className="absolute right-0 top-11 z-40 w-40 overflow-hidden rounded-2xl border border-slate-200 bg-white py-2 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.65)]">
					<button
						type="button"
						onClick={() => {
							setIsOpen(false);
							navigate("/mypage");
						}}
						className="block w-full px-4 py-2.5 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
					>
						마이페이지
					</button>
					<button
						type="button"
						onClick={() => void handleSignout()}
						className="block w-full px-4 py-2.5 text-left text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
					>
						로그아웃
					</button>
				</div>
			)}
		</div>
	);
}
