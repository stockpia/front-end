import type {
  AmountCalculationResponse,
  CalculateByAmountRequest,
  CalculateByQuantityRequest,
  CalculationHistoryResponse,
  HoldingInfo,
  HoldingInfoResponse,
  QuantityCalculationResponse,
  SaveCalculationRequest,
  SaveCalculationResponse,
} from "@/types/averagingCalculator";

const DEFAULT_SYMBOL = "005930";
const DEFAULT_COMPANY = "삼성전자";
const DEFAULT_FETCHED_AT = "2026-01-28 10:30:00";

const HOLDING_BASE: HoldingInfo = {
  quantity: 100,
  avg_price: 75000,
  current_price: 71300,
  total_cost: 7500000,
  current_value: 7130000,
  profit_loss: -370000,
  profit_loss_pct: -4.93,
  fetched_at: DEFAULT_FETCHED_AT,
};

export const holdingInfoMock: HoldingInfoResponse = {
  symbol: DEFAULT_SYMBOL,
  company_name: DEFAULT_COMPANY,
  is_holding: true,
  holding_info: HOLDING_BASE,
};

export const notHoldingInfoMock: HoldingInfoResponse = {
  symbol: DEFAULT_SYMBOL,
  company_name: DEFAULT_COMPANY,
  is_holding: false,
  message: "현재 보유 중이 아닙니다",
};

export const quantityCalculationMock: QuantityCalculationResponse = {
  symbol: DEFAULT_SYMBOL,
  company_name: DEFAULT_COMPANY,
  calculation_mode: "quantity",
  input: {
    current_avg_price: 75000,
    current_quantity: 100,
    current_price: 71300,
    additional_price: 70000,
    additional_quantity: 10,
  },
  result: {
    new_avg_price: 74545,
    avg_price_change: -455,
    avg_price_change_pct: -0.61,
    total_quantity: 110,
    total_cost: 8200000,
    additional_cost: 700000,
    breakeven_price: 74545,
    profit_if_sell_now: -137000,
    profit_pct: -1.67,
  },
  fetched_at: DEFAULT_FETCHED_AT,
};

export const amountCalculationMock: AmountCalculationResponse = {
  symbol: DEFAULT_SYMBOL,
  company_name: DEFAULT_COMPANY,
  calculation_mode: "amount",
  input: {
    current_avg_price: 75000,
    current_quantity: 100,
    current_price: 71300,
    investment_amount: 1000000,
    purchase_price: 70000,
    calculated_quantity: 14,
  },
  result: {
    new_avg_price: 74561,
    avg_price_change: -439,
    avg_price_change_pct: -0.59,
    total_quantity: 114,
    total_cost: 8500000,
    additional_cost: 980000,
    breakeven_price: 74561,
    profit_if_sell_now: -168000,
    profit_pct: -1.98,
  },
  fetched_at: DEFAULT_FETCHED_AT,
};

export const saveCalculationMock: SaveCalculationResponse = {
  calculation_id: "calc_20260128_103000_005930",
  symbol: DEFAULT_SYMBOL,
  saved_at: DEFAULT_FETCHED_AT,
  message: "계산 결과가 저장되었습니다",
};

export const calculationHistoryMock: CalculationHistoryResponse = {
  symbol: DEFAULT_SYMBOL,
  company_name: DEFAULT_COMPANY,
  total_count: 5,
  calculations: [
    {
      calculation_id: "calc_20260128_103000_005930",
      saved_at: "2026-01-28 10:30:00",
      calculation_mode: "quantity",
      input: {
        additional_price: 70000,
        additional_quantity: 10,
      },
      result_summary: {
        new_avg_price: 74545,
        total_quantity: 110,
        total_cost: 8200000,
      },
    },
    {
      calculation_id: "calc_20260127_151500_005930",
      saved_at: "2026-01-27 15:15:00",
      calculation_mode: "amount",
      input: {
        investment_amount: 1000000,
        purchase_price: 69000,
      },
      result_summary: {
        new_avg_price: 74421,
        total_quantity: 114,
        total_cost: 8500000,
      },
    },
  ],
};

export function mockGetHoldingInfo(symbol: string): HoldingInfoResponse {
  if (symbol !== DEFAULT_SYMBOL) {
    return {
      symbol,
      company_name: "알 수 없는 종목",
      is_holding: false,
      message: "현재 보유 중이 아닙니다",
    };
  }
  return holdingInfoMock;
}

export function mockCalculateByQuantity(
  request: CalculateByQuantityRequest,
): QuantityCalculationResponse {
  return {
    ...quantityCalculationMock,
    symbol: request.symbol,
    input: {
      ...quantityCalculationMock.input,
      additional_price: request.additional_price,
      additional_quantity: request.additional_quantity,
    },
  };
}

export function mockCalculateByAmount(
  request: CalculateByAmountRequest,
): AmountCalculationResponse {
  const calculatedQuantity = Math.floor(
    request.investment_amount / request.purchase_price,
  );
  return {
    ...amountCalculationMock,
    symbol: request.symbol,
    input: {
      ...amountCalculationMock.input,
      investment_amount: request.investment_amount,
      purchase_price: request.purchase_price,
      calculated_quantity: calculatedQuantity,
    },
  };
}

export function mockSaveCalculation(
  request: SaveCalculationRequest,
): SaveCalculationResponse {
  return {
    ...saveCalculationMock,
    symbol: request.symbol,
  };
}

export function mockGetCalculationHistory(
  symbol: string,
  limit = 10,
): CalculationHistoryResponse {
  return {
    ...calculationHistoryMock,
    symbol,
    calculations: calculationHistoryMock.calculations.slice(0, limit),
  };
}
