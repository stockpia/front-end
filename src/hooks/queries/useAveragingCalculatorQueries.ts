import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  calculateByAmount,
  calculateByQuantity,
  fetchCalculationHistory,
  fetchHoldingInfo,
  saveCalculation,
} from "@/lib/api/averaging";
import type {
  AmountCalculationResponse,
  CalculateByAmountRequest,
  CalculateByQuantityRequest,
  CalculationHistoryResponse,
  HoldingInfoResponse,
  QuantityCalculationResponse,
  SaveCalculationRequest,
} from "@/types/averagingCalculator";

const HISTORY_LIMIT = 10;

function toErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) {
    return error.message;
  }
  return error ? fallback : null;
}

type CalcResponse = QuantityCalculationResponse | AmountCalculationResponse;

export function averagingHoldingQueryKey(symbol: string) {
  return ["averaging-holding", symbol] as const;
}

export function averagingHistoryQueryKey(symbol: string, limit: number) {
  return ["averaging-history", symbol, limit] as const;
}

export function useAveragingHoldingQuery(
  symbol: string,
  options?: { enabled?: boolean },
) {
  const query = useQuery({
    queryKey: averagingHoldingQueryKey(symbol),
    enabled: options?.enabled ?? true,
    queryFn: ({ signal }) => fetchHoldingInfo(symbol, signal),
  });

  const holdingData: HoldingInfoResponse | null = query.data ?? null;
  const isHolding = holdingData?.is_holding === true;
  const holdingInfo = isHolding ? holdingData.holding_info : null;

  return {
    ...query,
    holdingData,
    holdingInfo,
    isHolding,
    errorMessage: toErrorMessage(
      query.error,
      "보유 종목 정보를 불러오는 중 오류가 발생했습니다.",
    ),
  };
}

export function useAveragingHistoryQuery(
  symbol: string,
  options?: { enabled?: boolean; limit?: number },
) {
  const limit = options?.limit ?? HISTORY_LIMIT;
  const query = useQuery({
    queryKey: averagingHistoryQueryKey(symbol, limit),
    enabled: options?.enabled ?? true,
    queryFn: ({ signal }) => fetchCalculationHistory(symbol, limit, signal),
  });

  return {
    ...query,
    history: (query.data?.calculations ??
      []) as CalculationHistoryResponse["calculations"],
    errorMessage: toErrorMessage(
      query.error,
      "계산 히스토리를 불러오는 중 오류가 발생했습니다.",
    ),
    limit,
  };
}

export function useAveragingQuantityCalculationMutation() {
  const mutation = useMutation({
    mutationFn: (request: CalculateByQuantityRequest) =>
      calculateByQuantity(request),
  });

  return {
    ...mutation,
    errorMessage: toErrorMessage(
      mutation.error,
      "계산 중 오류가 발생했습니다.",
    ),
  };
}

export function useAveragingAmountCalculationMutation() {
  const mutation = useMutation({
    mutationFn: (request: CalculateByAmountRequest) =>
      calculateByAmount(request),
  });

  return {
    ...mutation,
    errorMessage: toErrorMessage(
      mutation.error,
      "계산 중 오류가 발생했습니다.",
    ),
  };
}

export function useSaveAveragingCalculationMutation(
  symbol: string,
  limit = HISTORY_LIMIT,
) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (request: SaveCalculationRequest) => saveCalculation(request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: averagingHistoryQueryKey(symbol, limit),
      });
    },
  });

  return {
    ...mutation,
    errorMessage: toErrorMessage(
      mutation.error,
      "계산 저장 중 오류가 발생했습니다.",
    ),
  };
}

export type { CalcResponse };
