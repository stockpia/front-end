type LoadingSpinnerProps = {
	label?: string;
	size?: "sm" | "md" | "lg";
	className?: string;
};

const SIZE_MAP: Record<NonNullable<LoadingSpinnerProps["size"]>, string> = {
	sm: "h-4 w-4 border-2",
	md: "h-6 w-6 border-[3px]",
	lg: "h-8 w-8 border-4",
};

export default function LoadingSpinner({
	label = "로딩 중...",
	size = "md",
	className = "",
}: LoadingSpinnerProps) {
	return (
		<output
			className={`inline-flex items-center gap-2 text-slate-400 ${className}`}
			aria-live="polite"
		>
			<span
				className={`animate-spin rounded-full border-slate-300 border-t-slate-600 ${SIZE_MAP[size]}`}
				aria-hidden="true"
			/>
			<span className="text-xs font-semibold">{label}</span>
		</output>
	);
}
