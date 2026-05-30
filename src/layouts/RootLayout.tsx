import type { PropsWithChildren } from "react";
import { useLocation } from "react-router-dom";
import BackButton from "@/components/BackButton";
import BottomNavigation from "@/components/BottomNavigation";

export function RootLayout({ children }: PropsWithChildren) {
	const { pathname } = useLocation();
	const showBackButton = !["/", "/stocks"].includes(pathname);
	const showBottomNavigation = pathname !== "/login";

	return (
		<div className="min-h-svh bg-gray-50">
			<div
				className={`
          mx-auto min-h-svh w-full max-w-120
          bg-white
          px-3 sm:px-5
          pt-[env(safe-area-inset-top)]
          ${showBottomNavigation ? "pb-[calc(env(safe-area-inset-bottom)+6rem)]" : "pb-[env(safe-area-inset-bottom)]"}
        `}
			>
				{showBackButton && (
					<div className="sticky top-0 z-30 bg-white pt-4 pb-2">
						<BackButton />
					</div>
				)}
				{children}
			</div>
			{showBottomNavigation && <BottomNavigation />}
		</div>
	);
}
