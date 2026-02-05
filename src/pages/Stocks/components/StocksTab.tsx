type StockTab = "all" | "watchlist" | "holding";

type StocksTabProps = {
	value: StockTab;
	onChange: (tab: StockTab) => void;
};

export default function StocksTab({ value, onChange }: StocksTabProps) {
	const tabs: { id: StockTab; label: string }[] = [
		{ id: "all", label: "전체" },
		{ id: "watchlist", label: "관심 종목" },
		{ id: "holding", label: "보유 종목" },
	];

	return (
		<div className="flex flex-wrap gap-2">
			{tabs.map((tab) => {
				const isActive = tab.id === value;
				return (
					<button
						key={tab.id}
						type="button"
						onClick={() => onChange(tab.id)}
						className={
							"rounded-full border px-4 py-2 text-sm font-semibold transition " +
							(isActive
								? "border-slate-900 bg-slate-900 text-white"
								: "border-slate-200 bg-white text-slate-500 hover:text-slate-900")
						}
					>
						{tab.label}
					</button>
				);
			})}
		</div>
	);
}

export type { StockTab };
