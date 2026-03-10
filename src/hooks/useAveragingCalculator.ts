import { useMemo, useState } from "react";
import {
  useAveragingAmountCalculationMutation,
  useAveragingHistoryQuery,
  useAveragingHoldingQuery,
  useAveragingQuantityCalculationMutation,
  useSaveAveragingCalculationMutation,
  type CalcResponse,
} from "@/hooks/queries/useAveragingCalculatorQueries";
import type { CalculationHistoryResponse } from "@/types/averagingCalculator";

type InputMode = "quantity" | "amount";
type MainTab = "calculate" | "history";

function toPositiveNumber(value: string) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
}

export function useAveragingCalculator(symbol: string) {
  const [accountConnected, setAccountConnected] = useState(false);
  const [mainTab, setMainTab] = useState<MainTab>("calculate");
  const [inputMode, setInputMode] = useState<InputMode>("quantity");
  const [buyPriceInput, setBuyPriceInput] = useState("");
  const [buyQuantityInput, setBuyQuantityInput] = useState("");
  const [buyAmountInput, setBuyAmountInput] = useState("");

  const holdingQuery = useAveragingHoldingQuery(symbol, {
    enabled: accountConnected,
  });
  const historyQuery = useAveragingHistoryQuery(symbol, {
    enabled: accountConnected,
  });
  const quantityCalculationMutation = useAveragingQuantityCalculationMutation();
  const amountCalculationMutation = useAveragingAmountCalculationMutation();
  const saveMutation = useSaveAveragingCalculationMutation(symbol);

  const { holdingData, holdingInfo, isHolding } = holdingQuery;
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

  const canCalculate =
    accountConnected &&
    isHolding &&
    Boolean(holdingInfo) &&
    buyPrice > 0 &&
    !buyPriceError &&
    (inputMode === "quantity"
      ? Boolean(buyQuantity) && !buyQuantityError
      : Boolean(buyAmount) && !buyAmountError);

  const activeCalculationMutation =
    inputMode === "quantity"
      ? quantityCalculationMutation
      : amountCalculationMutation;
  const calcResult = (activeCalculationMutation.data ??
    null) as CalcResponse | null;
  const history =
    historyQuery.history as CalculationHistoryResponse["calculations"];

  const calculatedQuantity = useMemo(() => {
    if (calcResult?.calculation_mode === "amount") {
      return calcResult.input.calculated_quantity;
    }
    if (!buyAmount || buyPrice <= 0) {
      return 0;
    }
    return Math.floor(buyAmount / buyPrice);
  }, [calcResult, buyAmount, buyPrice]);

  const canSave = Boolean(
    isHolding &&
    calcResult &&
    !buyPriceError &&
    !buyQuantityError &&
    !buyAmountError &&
    !saveMutation.isPending,
  );

  const hasInputError = buyPriceError || buyQuantityError || buyAmountError;

  const connectAccount = () => {
    setAccountConnected(true);
    setBuyPriceInput("");
    setBuyQuantityInput("");
    setBuyAmountInput("");
  };

  const resetCalculation = () => {
    setBuyPriceInput("");
    setBuyQuantityInput("");
    setBuyAmountInput("");
    setMainTab("calculate");
  };

  const applyHistory = (
    item: CalculationHistoryResponse["calculations"][number],
  ) => {
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

  const saveCurrentCalculation = async () => {
    if (!calcResult || !canSave) {
      return;
    }
    await saveMutation.mutateAsync(calcResult);
  };

  const runCalculation = async () => {
    if (!canCalculate || activeCalculationMutation.isPending) {
      return;
    }
    if (inputMode === "quantity") {
      await quantityCalculationMutation.mutateAsync({
        symbol,
        additional_price: buyPrice,
        additional_quantity: buyQuantity as number,
      });
      return;
    }
    await amountCalculationMutation.mutateAsync({
      symbol,
      investment_amount: buyAmount as number,
      purchase_price: buyPrice,
    });
  };

  return {
    accountConnected,
    mainTab,
    inputMode,
    buyPriceInput,
    buyQuantityInput,
    buyAmountInput,
    buyPriceError,
    buyQuantityError,
    buyAmountError,
    buyPrice,
    defaultBuyPrice,
    holdingData,
    holdingInfo,
    isHolding,
    calcResult,
    history,
    calculatedQuantity,
    canCalculate,
    canSave,
    hasInputError,
    holdingLoading: holdingQuery.isLoading,
    holdingErrorMessage: holdingQuery.errorMessage,
    calculationLoading: activeCalculationMutation.isPending,
    calculationErrorMessage: activeCalculationMutation.errorMessage,
    historyLoading: historyQuery.isLoading,
    historyErrorMessage: historyQuery.errorMessage,
    saveLoading: saveMutation.isPending,
    saveErrorMessage: saveMutation.errorMessage,
    setMainTab,
    setInputMode,
    setBuyPriceInput,
    setBuyQuantityInput,
    setBuyAmountInput,
    connectAccount,
    resetCalculation,
    runCalculation,
    saveCurrentCalculation,
    applyHistory,
  };
}
