import LoadingSpinner from "@/components/LoadingSpinner";
import type { StockItem, StockSort } from "@/types/stocks";

type StocksListProps = {
  title: string;
  items: StockItem[];
  selectedId: string;
  onSelect: (item: StockItem) => void;
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
            <ul className="mt-4 max-h-[360px] space-y-3 overflow-y-auto pr-1">
              {items.map((item) => {
                const isActive = item.ticker === selectedId;
                const isPositive = item.change_rate >= 0;
                return (
                  <li key={item.ticker}>
                    <button
                      type="button"
                      onClick={() => onSelect(item)}
                      className={
                        "flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition " +
                        (isActive
                          ? "border-slate-900 bg-slate-900/5"
                          : "border-slate-200 bg-white hover:border-slate-300")
                      }>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {item.name}
                        </p>
                        <p className="text-xs text-slate-400">{item.ticker}</p>
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
