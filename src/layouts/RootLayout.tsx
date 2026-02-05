import type { PropsWithChildren } from "react";

export function RootLayout({ children }: PropsWithChildren) {
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
				{children}
			</div>
		</div>
	);
}
