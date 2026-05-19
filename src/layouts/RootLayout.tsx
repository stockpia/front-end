import type { PropsWithChildren } from "react";
import { useLocation } from "react-router-dom";
import BackButton from "@/components/BackButton";
import HomeButton from "@/components/HomeButton";

export function RootLayout({ children }: PropsWithChildren) {
	const { pathname } = useLocation();
	const showBackButton = !["/", "/stocks"].includes(pathname);
	const showHomeButton = pathname === "/stocks";

	return (
		<div className="min-h-svh bg-gray-50">
			<div
				className="
          mx-auto min-h-svh w-full max-w-120
          bg-white
          px-5
          pt-[env(safe-area-inset-top)]
          pb-[env(safe-area-inset-bottom)]
        "
			>
				{showHomeButton && (
					<div className="sticky top-0 z-30 bg-white pt-4 pb-2">
						<HomeButton />
					</div>
				)}
				{showBackButton && (
					<div className="sticky top-0 z-30 bg-white pt-4 pb-2">
						<BackButton />
					</div>
				)}
				{children}
			</div>
		</div>
	);
}
