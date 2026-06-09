import LoadingSpinner from "@/components/LoadingSpinner";
import type { StockItem, StockSort } from "@/types/stocks";

type StocksListProps = {
	title: string;
	items: StockItem[];
	selectedId: string;
	onSelect: (item: StockItem) => void;
	notice?: string | null;
	actionLabel?: string;
	onAction?: () => void;
	secondaryActionLabel?: string;
	onSecondaryAction?: () => void;
	sortBy: StockSort;
	onSortChange: (sortBy: StockSort) => void;
	sortOptions: { value: StockSort; label: string }[];
	metaLabel?: string;
	/**
	 * % 컬럼의 의미 — 전체 탭이면 "당일 변동률" (시장 기준),
	 * 보유 탭이면 "내 수익률" (매수가 기준). 행 라벨로 명시.
	 */
	rateLabel?: string;
	isLoading?: boolean;
	error?: string | null;
	emptyLabel?: string;
};

export default function StocksList({
	title,
	items,
	selectedId,
	onSelect,
	notice = null,
	actionLabel,
	onAction,
	secondaryActionLabel,
	onSecondaryAction,
	sortBy,
	onSortChange,
	sortOptions,
	metaLabel = "거래량",
	rateLabel = "변동률",
	isLoading = false,
	error = null,
	emptyLabel = "표시할 종목이 없습니다.",
}: StocksListProps) {
	return (
		<div className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4">
			<div className="flex items-center justify-between">
				{title ? (
					<h3 className="text-lg font-semibold text-slate-900">{title}</h3>
				) : (
					<span />
				)}
				{!notice && (
					<div className="flex items-center gap-2 text-xs font-semibold">
						{sortOptions.map((option, index) => {
							const isActive = option.value === sortBy;
							return (
								<button
									key={option.value}
									type="button"
									onClick={() => onSortChange(option.value)}
									className={
										"transition " +
										(isActive
											? "text-slate-900"
											: "text-slate-400 hover:text-slate-600")
									}
								>
									{option.label}
									{index < sortOptions.length - 1 ? " |" : ""}
								</button>
							);
						})}
					</div>
				)}
			</div>
			{isLoading ? (
				<div className="mt-4 flex justify-center">
					<LoadingSpinner label="목록을 불러오는 중..." size="sm" />
				</div>
			) : (
				<>
					{error && (
						<p className="mt-4 text-xs font-semibold text-rose-500">
							목록을 불러오지 못했습니다. {error}
						</p>
					)}
					{!error && notice && (
						<div className="mt-4 rounded-2xl bg-slate-50 px-4 py-5">
							<p className="text-sm font-bold text-slate-900">{notice}</p>
							<div className="mt-4 grid grid-cols-2 gap-2">
								{actionLabel && onAction && (
									<button
										type="button"
										onClick={onAction}
										className="w-full rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
									>
										{actionLabel}
									</button>
								)}
								{secondaryActionLabel && onSecondaryAction && (
									<button
										type="button"
										onClick={onSecondaryAction}
										className="w-full rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
									>
										{secondaryActionLabel}
									</button>
								)}
							</div>
						</div>
					)}
					{!error && !notice && items.length === 0 && (
						<p className="mt-4 text-xs font-semibold text-slate-400">
							{emptyLabel}
						</p>
					)}
					{!error && !notice && items.length > 0 && (
						<ul className="mt-4 max-h-[360px] space-y-3 overflow-y-auto">
							{items.map((item) => {
								const isActive = item.ticker === selectedId;
								const isPositive = item.change_rate >= 0;
								// 가격 0 인 row = 검색 결과 (가격 없음). "상세 보기" 만 표시.
								const hasPriceData = item.current_price > 0;
								return (
									<li key={item.ticker}>
										<button
											type="button"
											onClick={() => onSelect(item)}
											className={
												"flex w-full items-center justify-between rounded-2xl border px-3 py-3 text-left transition " +
												(isActive
													? "border-slate-900 bg-slate-900/5"
													: "border-slate-200 bg-white hover:border-slate-300")
											}
										>
											<div>
												<p className="text-sm font-semibold text-slate-900">
													{item.name}
												</p>
												<p className="text-xs text-slate-400">{item.ticker}</p>
											</div>
											{hasPriceData ? (
												<div className="text-right">
													<p className="text-sm font-semibold text-slate-900">
														{item.current_price.toLocaleString()}원
													</p>
													<p className="flex items-center justify-end gap-1 text-xs font-semibold">
														<span className="text-[10px] font-medium text-slate-400">
															{rateLabel}
														</span>
														<span
															className={
																isPositive ? "text-rose-500" : "text-blue-500"
															}
														>
															{isPositive ? "+" : ""}
															{item.change_rate.toFixed(2)}%
														</span>
													</p>
													<p className="text-[11px] text-slate-400">
														{metaLabel} {item.volume.toLocaleString()}
													</p>
												</div>
											) : (
												<span className="text-xs font-semibold text-slate-400">
													상세 보기 →
												</span>
											)}
										</button>
									</li>
								);
							})}
						</ul>
					)}
				</>
			)}
		</div>
	);
}

export type { StockItem };
export type { StockSort };
