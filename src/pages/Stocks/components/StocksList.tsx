import LoadingSpinner from "@/components/LoadingSpinner";
import type { StockItem, StockSort } from "@/types/stocks";

type StocksListProps = {
  title: string;
  items: StockItem[];
  selectedId: string;
  onSelect: (item: StockItem) => void;
  onToggleWatchlist?: (item: StockItem) => void;
  watchlistedTickers?: Set<string>;
  sortBy: StockSort;
  onSortChange: (sortBy: StockSort) => void;
  sortOptions: { value: StockSort; label: string }[];
  metaLabel?: string;
  isLoading?: boolean;
  error?: string | null;
  emptyLabel?: string;
};

export default function StocksList({
  title,
  items,
  selectedId,
  onSelect,
  onToggleWatchlist,
  watchlistedTickers,
  sortBy,
  onSortChange,
  sortOptions,
  metaLabel = "거래량",
  isLoading = false,
  error = null,
  emptyLabel = "표시할 종목이 없습니다.",
}: StocksListProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
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
                }>
                {option.label}
                {index < sortOptions.length - 1 ? " |" : ""}
              </button>
            );
          })}
        </div>
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
          {!error && items.length === 0 && (
            <p className="mt-4 text-xs font-semibold text-slate-400">
              {emptyLabel}
            </p>
          )}
          {!error && items.length > 0 && (
            <ul className="mt-4 max-h-[360px] space-y-3 overflow-y-auto">
              {items.map((item) => {
                const isActive = item.ticker === selectedId;
                const isPositive = item.change_rate >= 0;
                const isWatchlisted =
                  watchlistedTickers?.has(item.ticker) ?? false;
                return (
                  <li key={item.ticker}>
                    <div
                      className={
                        "flex items-center gap-3 rounded-2xl border px-4 py-3 transition " +
                        (isActive
                          ? "border-slate-900 bg-slate-900/5"
                          : "border-slate-200 bg-white hover:border-slate-300")
                      }>
                      <button
                        type="button"
                        onClick={() => onToggleWatchlist?.(item)}
                        aria-label={`${item.name} 관심 종목 추가`}
                        className={
                          "shrink-0 transition " +
                          (isWatchlisted
                            ? "text-rose-500"
                            : "text-slate-300 hover:text-slate-500")
                        }>
                        <svg
                          viewBox="0 0 24 24"
                          fill={isWatchlisted ? "currentColor" : "none"}
                          stroke="currentColor"
                          strokeWidth="1.8"
                          className="h-5 w-5"
                          aria-hidden="true">
                          <path d="M12 21s-6.7-4.35-9.33-8.09C.8 10.22 1.19 6.2 4.12 4.44c2.01-1.21 4.54-.76 6.22 1.02L12 7.2l1.66-1.74c1.68-1.78 4.21-2.23 6.22-1.02 2.93 1.76 3.32 5.78 1.45 8.47C18.7 16.65 12 21 12 21z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => onSelect(item)}
                        className="flex min-w-0 flex-1 items-center justify-between text-left">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {item.name}
                          </p>
                          <p className="text-xs text-slate-400">
                            {item.ticker}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-slate-900">
                            {item.current_price.toLocaleString()}원
                          </p>
                          <p
                            className={
                              "text-xs font-semibold " +
                              (isPositive ? "text-rose-500" : "text-blue-500")
                            }>
                            {isPositive ? "+" : ""}
                            {item.change_rate.toFixed(2)}%
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {metaLabel} {item.volume.toLocaleString()}
                          </p>
                        </div>
                      </button>
                    </div>
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
