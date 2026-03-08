import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
	calculateByAmount,
	calculateByQuantity,
	fetchCalculationHistory,
	fetchHoldingInfo,
	saveCalculation,
} from "@/lib/api/averaging";
import type {
	AmountCalculationResponse,
	CalculationHistoryResponse,
	HoldingInfoResponse,
	QuantityCalculationResponse,
} from "@/types/averagingCalculator";

type InputMode = "quantity" | "amount";
type MainTab = "calculate" | "history";
type CalcResponse = QuantityCalculationResponse | AmountCalculationResponse;

const HISTORY_LIMIT = 10;

function toPositiveNumber(value: string) {
	const parsed = Number(value);
	if (!Number.isFinite(parsed) || parsed <= 0) {
		return null;
	}
	return parsed;
}

function toErrorMessage(error: unknown, fallback: string) {
	if (error instanceof Error) {
		return error.message;
	}
	return error ? fallback : null;
}

export function averagingHoldingQueryKey(symbol: string) {
	return ["averaging-holding", symbol] as const;
}

export function averagingHistoryQueryKey(symbol: string, limit: number) {
	return ["averaging-history", symbol, limit] as const;
}

export function useAveragingCalculator(symbol: string) {
	const queryClient = useQueryClient();

	const [accountConnected, setAccountConnected] = useState(false);
	const [mainTab, setMainTab] = useState<MainTab>("calculate");
	const [inputMode, setInputMode] = useState<InputMode>("quantity");
	const [buyPriceInput, setBuyPriceInput] = useState("");
	const [buyQuantityInput, setBuyQuantityInput] = useState("");
	const [buyAmountInput, setBuyAmountInput] = useState("");

	const holdingQuery = useQuery({
		queryKey: averagingHoldingQueryKey(symbol),
		enabled: accountConnected,
		queryFn: ({ signal }) => fetchHoldingInfo(symbol, signal),
	});

	const holdingData: HoldingInfoResponse | null = holdingQuery.data ?? null;
	const isHolding = holdingData?.is_holding === true;
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

	const canCalculate =
		accountConnected &&
		isHolding &&
		Boolean(holdingInfo) &&
		buyPrice > 0 &&
		!buyPriceError &&
		(inputMode === "quantity"
			? Boolean(buyQuantity) && !buyQuantityError
			: Boolean(buyAmount) && !buyAmountError);

	const calculationMutation = useMutation({
		mutationFn: async () => {
			if (inputMode === "quantity") {
				return calculateByQuantity({
					symbol,
					additional_price: buyPrice,
					additional_quantity: buyQuantity as number,
				});
			}

			return calculateByAmount({
				symbol,
				investment_amount: buyAmount as number,
				purchase_price: buyPrice,
			});
		},
	});

	const historyQuery = useQuery({
		queryKey: averagingHistoryQueryKey(symbol, HISTORY_LIMIT),
		enabled: accountConnected,
		queryFn: ({ signal }) =>
			fetchCalculationHistory(symbol, HISTORY_LIMIT, signal),
	});

	const saveMutation = useMutation({
		mutationFn: (calculation: CalcResponse) =>
			saveCalculation({
				symbol: calculation.symbol,
				calculation_mode: calculation.calculation_mode,
				input:
					calculation.calculation_mode === "quantity"
						? {
								additional_price: calculation.input.additional_price,
								additional_quantity: calculation.input.additional_quantity,
							}
						: {
								investment_amount: calculation.input.investment_amount,
								purchase_price: calculation.input.purchase_price,
							},
				result: {
					new_avg_price: calculation.result.new_avg_price,
					total_quantity: calculation.result.total_quantity,
					total_cost: calculation.result.total_cost,
				},
			}),
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: averagingHistoryQueryKey(symbol, HISTORY_LIMIT),
			});
		},
	});

	const calcResult = (calculationMutation.data ?? null) as CalcResponse | null;
	const history = (historyQuery.data?.calculations ??
		[]) as CalculationHistoryResponse["calculations"];

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
		if (!canCalculate || calculationMutation.isPending) {
			return;
		}
		await calculationMutation.mutateAsync();
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
		holdingErrorMessage: toErrorMessage(
			holdingQuery.error,
			"보유 종목 정보를 불러오는 중 오류가 발생했습니다.",
		),
		calculationLoading: calculationMutation.isPending,
		calculationErrorMessage: toErrorMessage(
			calculationMutation.error,
			"계산 중 오류가 발생했습니다.",
		),
		historyLoading: historyQuery.isLoading,
		historyErrorMessage: toErrorMessage(
			historyQuery.error,
			"계산 히스토리를 불러오는 중 오류가 발생했습니다.",
		),
		saveLoading: saveMutation.isPending,
		saveErrorMessage: toErrorMessage(
			saveMutation.error,
			"계산 저장 중 오류가 발생했습니다.",
		),
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
