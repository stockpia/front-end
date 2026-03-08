import { api } from "@/lib/api/axios";
import type {
	AmountCalculationResponse,
	CalculateByAmountRequest,
	CalculateByQuantityRequest,
	CalculationHistoryResponse,
	HoldingInfoResponse,
	QuantityCalculationResponse,
	SaveCalculationRequest,
	SaveCalculationResponse,
} from "@/types/averagingCalculator";

export async function fetchHoldingInfo(symbol: string, signal?: AbortSignal) {
	const { data } = await api.get<HoldingInfoResponse>(
		`/web/averaging/holding/${symbol}`,
		{ signal },
	);
	return data;
}

export async function calculateByQuantity(request: CalculateByQuantityRequest) {
	const { data } = await api.post<QuantityCalculationResponse>(
		"/web/averaging/calculate/quantity",
		request,
	);
	return data;
}

export async function calculateByAmount(request: CalculateByAmountRequest) {
	const { data } = await api.post<AmountCalculationResponse>(
		"/web/averaging/calculate/amount",
		request,
	);
	return data;
}

export async function saveCalculation(request: SaveCalculationRequest) {
	const { data } = await api.post<SaveCalculationResponse>(
		"/web/averaging/save",
		request,
	);
	return data;
}

export async function fetchCalculationHistory(
	symbol: string,
	limit = 10,
	signal?: AbortSignal,
) {
	const { data } = await api.get<CalculationHistoryResponse>(
		`/web/averaging/history/${symbol}`,
		{
			params: { limit },
			signal,
		},
	);
	return data;
}
