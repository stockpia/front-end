import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  mockCalculateByAmount,
  mockCalculateByQuantity,
  mockGetCalculationHistory,
  mockGetHoldingInfo,
  mockSaveCalculation,
} from "@/mocks/averagingCalculator";
import type {
  AmountCalculationResponse,
  CalculationHistoryResponse,
  HoldingInfoResponse,
  QuantityCalculationResponse,
} from "@/types/averagingCalculator";

type InputMode = "quantity" | "amount";
type MainTab = "calculate" | "history";
type CalcResponse = QuantityCalculationResponse | AmountCalculationResponse;
type HistoryItem = CalculationHistoryResponse["calculations"][number];

const KRW_NUMBER = new Intl.NumberFormat("ko-KR");
const RATE_NUMBER = new Intl.NumberFormat("ko-KR", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

const toPositiveNumber = (value: string) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
};

const formatCurrency = (value: number) =>
  `${KRW_NUMBER.format(Math.round(value))}원`;
const formatQty = (value: number) =>
  KRW_NUMBER.format(Number(value.toFixed(4)));
const formatRate = (value: number) => `${RATE_NUMBER.format(value)}%`;
const formatDateTime = (value: string) =>
  new Date(value).toLocaleString("ko-KR", { hour12: false });

export default function AveragingCalculator() {
  const navigate = useNavigate();
  const { stockId } = useParams();
  const [searchParams] = useSearchParams();

  const symbol = stockId ?? "005930";
  const name = searchParams.get("name") ?? "삼성전자";

  const [accountConnected, setAccountConnected] = useState(false);
  const [holdingData, setHoldingData] = useState<HoldingInfoResponse | null>(
    null,
  );
  const [mainTab, setMainTab] = useState<MainTab>("calculate");
  const [inputMode, setInputMode] = useState<InputMode>("quantity");
  const [buyPriceInput, setBuyPriceInput] = useState("");
  const [buyQuantityInput, setBuyQuantityInput] = useState("");
  const [buyAmountInput, setBuyAmountInput] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    if (!accountConnected) {
      setHoldingData(null);
      setHistory([]);
      return;
    }

    const holding = mockGetHoldingInfo(symbol);
    setHoldingData(holding);
    setHistory(mockGetCalculationHistory(symbol, 10).calculations);
  }, [accountConnected, symbol]);

  const isHolding = holdingData?.is_holding === true;
  const companyName = holdingData?.company_name ?? name;
  const holdingInfo = isHolding ? holdingData.holding_info : null;
  const defaultBuyPrice = holdingInfo?.current_price ?? 0;

  const buyPrice = toPositiveNumber(buyPriceInput) ?? defaultBuyPrice;
  const buyQuantity = toPositiveNumber(buyQuantityInput);
  const buyAmount = toPositiveNumber(buyAmountInput);

  const buyPriceError =
    buyPriceInput.length > 0 && toPositiveNumber(buyPriceInput) === null
      ? "매수 단가는 0보다 큰 숫자만 입력할 수 있어요."
      : null;
  const buyQuantityError =
    inputMode === "quantity" &&
    buyQuantityInput.length > 0 &&
    buyQuantity === null
      ? "추가 매수 수량은 0보다 큰 숫자만 입력할 수 있어요."
      : null;
  const buyAmountError =
    inputMode === "amount" && buyAmountInput.length > 0 && buyAmount === null
      ? "추가 투자 금액은 0보다 큰 숫자만 입력할 수 있어요."
      : null;

  const calcResult = useMemo<CalcResponse | null>(() => {
    if (!isHolding || !holdingInfo || buyPrice <= 0 || buyPriceError) {
      return null;
    }

    if (inputMode === "quantity") {
      if (!buyQuantity || buyQuantityError) {
        return null;
      }
      return mockCalculateByQuantity({
        symbol,
        additional_price: buyPrice,
        additional_quantity: buyQuantity,
      });
    }

    if (!buyAmount || buyAmountError) {
      return null;
    }

    return mockCalculateByAmount({
      symbol,
      investment_amount: buyAmount,
      purchase_price: buyPrice,
    });
  }, [
    isHolding,
    holdingInfo,
    inputMode,
    symbol,
    buyPrice,
    buyPriceError,
    buyQuantity,
    buyQuantityError,
    buyAmount,
    buyAmountError,
  ]);

  const canSave = Boolean(
    isHolding &&
    calcResult &&
    !buyPriceError &&
    !buyQuantityError &&
    !buyAmountError,
  );

  const calculatedQuantity = useMemo(() => {
    if (calcResult?.calculation_mode === "amount") {
      return calcResult.input.calculated_quantity;
    }
    if (!buyAmount || buyPrice <= 0) {
      return 0;
    }
    return Math.floor(buyAmount / buyPrice);
  }, [calcResult, buyAmount, buyPrice]);

  const handleConnect = () => {
    setAccountConnected(true);
    setBuyPriceInput("");
    setBuyQuantityInput("");
    setBuyAmountInput("");
  };

  const handleReset = () => {
    setBuyPriceInput("");
    setBuyQuantityInput("");
    setBuyAmountInput("");
    setMainTab("calculate");
  };

  const handleSave = () => {
    if (!canSave || !calcResult) {
      return;
    }

    const saveResponse =
      calcResult.calculation_mode === "quantity"
        ? mockSaveCalculation({
            symbol: calcResult.symbol,
            calculation_mode: "quantity",
            input: {
              additional_price: calcResult.input.additional_price,
              additional_quantity: calcResult.input.additional_quantity,
            },
            result: {
              new_avg_price: calcResult.result.new_avg_price,
              total_quantity: calcResult.result.total_quantity,
              total_cost: calcResult.result.total_cost,
            },
          })
        : mockSaveCalculation({
            symbol: calcResult.symbol,
            calculation_mode: "amount",
            input: {
              investment_amount: calcResult.input.investment_amount,
              purchase_price: calcResult.input.purchase_price,
            },
            result: {
              new_avg_price: calcResult.result.new_avg_price,
              total_quantity: calcResult.result.total_quantity,
              total_cost: calcResult.result.total_cost,
            },
          });

    const nextHistoryItem: HistoryItem = {
      calculation_id: saveResponse.calculation_id,
      saved_at: saveResponse.saved_at,
      calculation_mode: calcResult.calculation_mode,
      input:
        calcResult.calculation_mode === "quantity"
          ? {
              additional_price: calcResult.input.additional_price,
              additional_quantity: calcResult.input.additional_quantity,
            }
          : {
              investment_amount: calcResult.input.investment_amount,
              purchase_price: calcResult.input.purchase_price,
            },
      result_summary: {
        new_avg_price: calcResult.result.new_avg_price,
        total_quantity: calcResult.result.total_quantity,
        total_cost: calcResult.result.total_cost,
      },
    };

    setHistory((prev) => [nextHistoryItem, ...prev]);
  };

  const applyHistory = (item: HistoryItem) => {
    setInputMode(item.calculation_mode);
    if (
      item.calculation_mode === "quantity" &&
      "additional_quantity" in item.input
    ) {
      setBuyPriceInput(String(item.input.additional_price));
      setBuyQuantityInput(String(item.input.additional_quantity));
      setBuyAmountInput("");
    } else if (
      item.calculation_mode === "amount" &&
      "investment_amount" in item.input
    ) {
      setBuyPriceInput(String(item.input.purchase_price));
      setBuyAmountInput(String(item.input.investment_amount));
      setBuyQuantityInput("");
    }
    setMainTab("calculate");
  };

  const hasInputError = buyPriceError || buyQuantityError || buyAmountError;

  return (
    <div className="space-y-6 py-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_40px_-32px_rgba(15,23,42,0.6)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              물타기 계산기
            </h1>
          </div>
          {!accountConnected && (
            <button
              type="button"
              onClick={handleConnect}
              className="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900">
              계좌 연동
            </button>
          )}
        </div>
      </section>

      {!accountConnected && (
        <section className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
          <p className="text-sm text-slate-600">
            물타기 계산기는 계좌 연결 후 이용할 수 있어요.
          </p>
        </section>
      )}

      {accountConnected && !isHolding && (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 text-center">
          <p className="text-sm text-slate-600">
            {holdingData?.is_holding === false
              ? holdingData.message
              : "현재 보유 중인 종목이 없습니다."}
          </p>
        </section>
      )}

      {accountConnected && isHolding && holdingInfo && (
        <div className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_40px_-32px_rgba(15,23,42,0.6)]">
            <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-xs text-slate-500">종목명</p>
                <p className="mt-1 font-semibold text-slate-900">
                  {companyName} ({symbol})
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-xs text-slate-500">보유 수량</p>
                <p className="mt-1 font-semibold text-slate-900">
                  {formatQty(holdingInfo.quantity)}주
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-xs text-slate-500">평균 매입 단가</p>
                <p className="mt-1 font-semibold text-slate-900">
                  {formatCurrency(holdingInfo.avg_price)}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-xs text-slate-500">현재가</p>
                <p className="mt-1 font-semibold text-slate-900">
                  {formatCurrency(holdingInfo.current_price)}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-xs text-slate-500">평가 손익</p>
                <p
                  className={`mt-1 font-semibold ${
                    holdingInfo.profit_loss >= 0
                      ? "text-emerald-600"
                      : "text-rose-600"
                  }`}>
                  {formatCurrency(holdingInfo.profit_loss)} (
                  {formatRate(holdingInfo.profit_loss_pct)})
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-xs text-slate-500">데이터 기준 시점</p>
                <p className="mt-1 font-semibold text-slate-900">
                  {formatDateTime(holdingInfo.fetched_at)}
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_40px_-32px_rgba(15,23,42,0.6)]">
            {mainTab === "calculate" && (
              <div className="space-y-6">
                <div className="ml-auto flex w-fit flex-wrap items-center gap-2 rounded-2xl bg-slate-100 p-1">
                  <button
                    type="button"
                    onClick={() => setInputMode("quantity")}
                    className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                      inputMode === "quantity"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}>
                    수량 기준
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputMode("amount")}
                    className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                      inputMode === "amount"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}>
                    금액 기준
                  </button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-700">
                      추가 매수 단가
                    </span>
                    <input
                      value={buyPriceInput}
                      onChange={(event) => setBuyPriceInput(event.target.value)}
                      inputMode="decimal"
                      placeholder={String(defaultBuyPrice)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                    />
                    {buyPriceError && (
                      <p className="text-xs font-medium text-rose-600">
                        {buyPriceError}
                      </p>
                    )}
                  </label>

                  {inputMode === "quantity" ? (
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-slate-700">
                        추가 매수 수량
                      </span>
                      <input
                        value={buyQuantityInput}
                        onChange={(event) =>
                          setBuyQuantityInput(event.target.value)
                        }
                        inputMode="decimal"
                        placeholder="예: 10"
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                      />
                      {buyQuantityError && (
                        <p className="text-xs font-medium text-rose-600">
                          {buyQuantityError}
                        </p>
                      )}
                    </label>
                  ) : (
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-slate-700">
                        추가 투자 금액
                      </span>
                      <input
                        value={buyAmountInput}
                        onChange={(event) =>
                          setBuyAmountInput(event.target.value)
                        }
                        inputMode="decimal"
                        placeholder="예: 500000"
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                      />
                      {buyAmountError && (
                        <p className="text-xs font-medium text-rose-600">
                          {buyAmountError}
                        </p>
                      )}
                      <p className="text-xs text-slate-500">
                        자동 계산 수량: {formatQty(calculatedQuantity)}주
                      </p>
                    </label>
                  )}
                </div>

                <section className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-600">기존 평균 단가</p>
                    <p className="text-sm font-semibold text-slate-900">
                      {formatCurrency(holdingInfo.avg_price)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-600">새로운 평균 단가</p>
                    <p
                      className={`text-lg font-bold ${
                        calcResult && calcResult.result.avg_price_change < 0
                          ? "text-emerald-600"
                          : "text-amber-600"
                      }`}>
                      {calcResult
                        ? formatCurrency(calcResult.result.new_avg_price)
                        : "-"}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl bg-white p-3">
                      <p className="text-xs text-slate-500">총 보유 수량</p>
                      <p className="mt-1 font-semibold text-slate-900">
                        {calcResult
                          ? `${formatQty(calcResult.result.total_quantity)}주`
                          : "-"}
                      </p>
                    </div>
                    <div className="rounded-xl bg-white p-3">
                      <p className="text-xs text-slate-500">총 투자 금액</p>
                      <p className="mt-1 font-semibold text-slate-900">
                        {calcResult
                          ? formatCurrency(calcResult.result.total_cost)
                          : "-"}
                      </p>
                    </div>
                    <div className="rounded-xl bg-white p-3">
                      <p className="text-xs text-slate-500">현재가 기준 손익</p>
                      <p className="mt-1 font-semibold text-slate-900">
                        {calcResult
                          ? formatCurrency(calcResult.result.profit_if_sell_now)
                          : "-"}
                      </p>
                    </div>
                    <div className="rounded-xl bg-white p-3">
                      <p className="text-xs text-slate-500">
                        현재가 기준 수익률
                      </p>
                      <p className="mt-1 font-semibold text-slate-900">
                        {calcResult
                          ? formatRate(calcResult.result.profit_pct)
                          : "-"}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={!canSave}
                    className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300">
                    이 계산 저장하기
                  </button>

                  {hasInputError && (
                    <p className="text-xs text-rose-600">
                      입력값을 확인하면 결과가 실시간으로 반영됩니다.
                    </p>
                  )}
                </section>
              </div>
            )}

            {mainTab === "history" && (
              <section className="space-y-3">
                {history.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-600">
                    저장된 계산 내역이 없습니다.
                  </div>
                ) : (
                  history.map((item) => (
                    <button
                      type="button"
                      key={item.calculation_id}
                      onClick={() => applyHistory(item)}
                      className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-slate-300">
                      <p className="text-xs text-slate-500">
                        {formatDateTime(item.saved_at)}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {item.calculation_mode === "quantity" &&
                        "additional_quantity" in item.input
                          ? `추가 수량 ${formatQty(item.input.additional_quantity)}주`
                          : item.calculation_mode === "amount" &&
                              "investment_amount" in item.input
                            ? `추가 금액 ${formatCurrency(item.input.investment_amount)}`
                            : "입력 정보 없음"}
                      </p>
                      <p className="mt-1 text-sm text-slate-700">
                        계산 후 평균 단가{" "}
                        {formatCurrency(item.result_summary.new_avg_price)}
                      </p>
                    </button>
                  ))
                )}
              </section>
            )}

            <div className="flex flex-wrap items-center gap-2 border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={handleReset}
                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900">
                새 계산
              </button>
              <button
                type="button"
                onClick={() => setMainTab("history")}
                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900">
                이전 계산 보기
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900">
                계산 종료
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
