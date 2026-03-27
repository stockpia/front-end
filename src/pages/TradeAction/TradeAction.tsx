import { useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useStockReportQuery } from "@/hooks/queries/useStockCommunityNewsQueries";
import { useHoldingsQuery } from "@/hooks/queries/useStocksListQueries";

type TradeType = "buy" | "sell";
type OrderMode = "market" | "current" | "limit";
const QUANTITY_RATIO_OPTIONS = [10, 25, 50] as const;

const TRADE_CONTENT: Record<
  TradeType,
  {
    title: string;
    description: string;
    buttonLabel: string;
    buttonClassName: string;
    badgeClassName: string;
  }
> = {
  buy: {
    title: "구매하기",
    description: "지정 수량과 가격을 확인한 뒤 매수 주문을 준비합니다.",
    buttonLabel: "매수 주문 준비",
    buttonClassName:
      "bg-blue-600 text-white hover:bg-blue-700 focus-visible:outline-blue-600",
    badgeClassName: "bg-blue-100 text-blue-700",
  },
  sell: {
    title: "판매하기",
    description: "",
    buttonLabel: "판매 예약하기",
    buttonClassName:
      "bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:outline-emerald-600",
    badgeClassName: "bg-emerald-100 text-emerald-700",
  },
};

function formatCurrency(value: number) {
  return `${Math.round(value).toLocaleString("ko-KR")}원`;
}

function formatPercent(value: number) {
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${value.toFixed(2)}%`;
}

export default function TradeAction() {
  const navigate = useNavigate();
  const { stockId, tradeType } = useParams();
  const [searchParams] = useSearchParams();
  const [orderMode, setOrderMode] = useState<OrderMode>("limit");
  const [quantity, setQuantity] = useState("1");
  const [limitPriceInput, setLimitPriceInput] = useState("");

  const resolvedTradeType: TradeType = tradeType === "sell" ? "sell" : "buy";
  const content = TRADE_CONTENT[resolvedTradeType];
  const fallbackName = searchParams.get("name");
  const stockName = fallbackName ? decodeURIComponent(fallbackName) : stockId;

  const reportQuery = useStockReportQuery({
    symbol: stockId,
    enabled: Boolean(stockId),
  });
  const holdingsQuery = useHoldingsQuery({ enabled: true });

  const holding = useMemo(
    () => holdingsQuery.holdings.find((item) => item.ticker === stockId),
    [holdingsQuery.holdings, stockId],
  );

  const currentPrice = reportQuery.report?.summary.current_price ?? 0;
  const parsedQuantity = Number(quantity);
  const effectiveQuantity =
    Number.isFinite(parsedQuantity) && parsedQuantity > 0
      ? Math.floor(parsedQuantity)
      : 0;
  const limitPrice = Number(limitPriceInput.replaceAll(",", ""));
  const effectivePrice =
    orderMode === "market" || orderMode === "current"
      ? currentPrice
      : Number.isFinite(limitPrice) && limitPrice > 0
        ? limitPrice
        : 0;
  const estimatedAmount = effectiveQuantity * effectivePrice;
  const holdingQuantity = holding?.quantity ?? 0;
  const availableBuyBudget = holding?.eval_amount ?? currentPrice * 100;
  const expectedProfit = (currentPrice - effectivePrice) * effectiveQuantity;
  const expectedReturnRate =
    effectivePrice > 0
      ? ((currentPrice - effectivePrice) / effectivePrice) * 100
      : 0;
  const canProceed =
    Boolean(stockId) &&
    effectiveQuantity > 0 &&
    effectivePrice > 0 &&
    (resolvedTradeType === "buy" || holdingQuantity >= effectiveQuantity);

  const applyQuantityRatio = (
    ratio: (typeof QUANTITY_RATIO_OPTIONS)[number],
  ) => {
    if (resolvedTradeType === "sell") {
      setQuantity(String(Math.floor((holdingQuantity * ratio) / 100)));
      return;
    }

    if (effectivePrice <= 0) {
      return;
    }

    const nextQuantity = Math.floor(
      (availableBuyBudget * (ratio / 100)) / effectivePrice,
    );
    setQuantity(String(Math.max(nextQuantity, 0)));
  };

  const applyMaxQuantity = () => {
    if (resolvedTradeType === "sell") {
      setQuantity(String(holdingQuantity));
      return;
    }

    if (effectivePrice <= 0) {
      return;
    }

    setQuantity(String(Math.floor(availableBuyBudget / effectivePrice)));
  };

  const adjustLimitPrice = (delta: number) => {
    if (orderMode !== "limit") {
      return;
    }

    const basePrice = limitPrice > 0 ? limitPrice : currentPrice;
    const nextPrice = Math.max(basePrice + delta, 0);
    setLimitPriceInput(String(nextPrice));
  };

  const adjustQuantity = (delta: number) => {
    const nextQuantity = Math.max(effectiveQuantity + delta, 0);
    setQuantity(String(nextQuantity));
  };

  return (
    <div className="space-y-6 py-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_40px_-32px_rgba(15,23,42,0.6)]">
        <div>
          <div>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="text-sm font-medium text-slate-500 transition hover:text-slate-800">
              이전으로
            </button>
            <div className="mt-3 flex items-center gap-3">
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${content.badgeClassName}`}>
                {content.title}
              </span>
              <p className="text-sm text-slate-500">
                {stockName ?? "선택한 종목"} ({stockId ?? "-"})
              </p>
            </div>
            <h1 className="mt-3 text-2xl font-semibold text-slate-900">
              {stockName ?? "종목"} {content.title}
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {content.description}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_40px_-32px_rgba(15,23,42,0.6)]">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">주문 설정</h2>
            <div className="flex items-center rounded-full bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setOrderMode("limit")}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                  orderMode === "limit"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}>
                지정가
              </button>
              <button
                type="button"
                onClick={() => setOrderMode("current")}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                  orderMode === "current"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}>
                현재가
              </button>
              <button
                type="button"
                onClick={() => setOrderMode("market")}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                  orderMode === "market"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}>
                시장가
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                {orderMode === "limit"
                  ? "주문 단가"
                  : orderMode === "current"
                    ? "현재가"
                    : "시장가 기준 가격"}
              </span>
              <div className="mt-2 flex items-center rounded-2xl border border-slate-200 bg-white px-2 py-2 transition focus-within:border-slate-400">
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={
                    orderMode === "limit" ? limitPriceInput : currentPrice || ""
                  }
                  onChange={(event) => setLimitPriceInput(event.target.value)}
                  disabled={orderMode !== "limit"}
                  className="min-w-0 flex-1 border-none px-2 py-1 text-sm text-slate-900 outline-none disabled:cursor-not-allowed disabled:bg-transparent disabled:text-slate-400"
                  placeholder="가격 입력"
                />
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => adjustLimitPrice(-100)}
                    disabled={orderMode !== "limit"}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:border-slate-100 disabled:text-slate-300">
                    -
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustLimitPrice(100)}
                    disabled={orderMode !== "limit"}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:border-slate-100 disabled:text-slate-300">
                    +
                  </button>
                </div>
              </div>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                주문 수량
              </span>
              <div className="mt-2 flex items-center rounded-2xl border border-slate-200 bg-white px-2 py-2 transition focus-within:border-slate-400">
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
                  className="min-w-0 flex-1 border-none px-2 py-1 text-sm text-slate-900 outline-none"
                  placeholder="수량 입력"
                />
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => adjustQuantity(-1)}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900">
                    -
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustQuantity(1)}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900">
                    +
                  </button>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {QUANTITY_RATIO_OPTIONS.map((ratio) => (
                  <button
                    key={ratio}
                    type="button"
                    onClick={() => applyQuantityRatio(ratio)}
                    className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900">
                    {ratio}%
                  </button>
                ))}
                <button
                  type="button"
                  onClick={applyMaxQuantity}
                  className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900">
                  최대
                </button>
              </div>
            </label>
          </div>
        </article>

        <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_40px_-32px_rgba(15,23,42,0.6)]">
          <h2 className="text-lg font-semibold text-slate-900">주문 요약</h2>
          <div className="mt-5 space-y-4">
            {resolvedTradeType === "sell" ? (
              <>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">구매 가능 금액</span>
                  <span className="font-semibold text-slate-900">
                    {formatCurrency(availableBuyBudget)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">주문 수량</span>
                  <span className="font-semibold text-slate-900">
                    {effectiveQuantity.toLocaleString("ko-KR")}주
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">주문 단가</span>
                  <span className="font-semibold text-slate-900">
                    {effectivePrice > 0 ? formatCurrency(effectivePrice) : "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">총 주문 금액</span>
                  <span className="font-semibold text-slate-900">
                    {estimatedAmount > 0
                      ? formatCurrency(estimatedAmount)
                      : "-"}
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">예상 수익률</span>
                  <span className="font-semibold text-slate-900">
                    {estimatedAmount > 0
                      ? formatPercent(expectedReturnRate)
                      : "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">예상 손익</span>
                  <span className="font-semibold text-slate-900">
                    {estimatedAmount > 0 ? formatCurrency(expectedProfit) : "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">총 주문 금액</span>
                  <span className="font-semibold text-slate-900">
                    {estimatedAmount > 0
                      ? formatCurrency(estimatedAmount)
                      : "-"}
                  </span>
                </div>
              </>
            )}
          </div>

          {resolvedTradeType === "sell" &&
            holdingQuantity < effectiveQuantity && (
              <p className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
                보유 수량보다 많은 수량을 입력했습니다. 매도 가능 수량은{" "}
                {holdingQuantity.toLocaleString("ko-KR")}주입니다.
              </p>
            )}

          <button
            type="button"
            onClick={() =>
              navigate(
                `/stocks/${stockId ?? ""}/pending?name=${encodeURIComponent(
                  stockName ?? "",
                )}`,
              )
            }
            className="mt-6 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
          >
            체결 대기 목록
          </button>

          <button
            type="button"
            disabled={!canProceed}
            className={`mt-6 w-full rounded-2xl px-4 py-3 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 ${content.buttonClassName}`}>
            {content.buttonLabel}
          </button>
        </aside>
      </section>
    </div>
  );
}
