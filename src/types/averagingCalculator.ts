export type HoldingInfo = {
  quantity: number;
  avg_price: number;
  current_price: number;
  total_cost: number;
  current_value: number;
  profit_loss: number;
  profit_loss_pct: number;
  fetched_at: string;
};

export type HoldingInfoResponse =
  | {
      symbol: string;
      company_name: string;
      is_holding: true;
      holding_info: HoldingInfo;
    }
  | {
      symbol: string;
      company_name: string;
      is_holding: false;
      message: string;
    };

export type CalculateByQuantityRequest = {
  symbol: string;
  additional_price: number;
  additional_quantity: number;
};

export type CalculateByAmountRequest = {
  symbol: string;
  investment_amount: number;
  purchase_price: number;
};

export type QuantityCalculationResponse = {
  symbol: string;
  company_name: string;
  calculation_mode: "quantity";
  input: {
    current_avg_price: number;
    current_quantity: number;
    current_price: number;
    additional_price: number;
    additional_quantity: number;
  };
  result: {
    new_avg_price: number;
    avg_price_change: number;
    avg_price_change_pct: number;
    total_quantity: number;
    total_cost: number;
    additional_cost: number;
    breakeven_price: number;
    profit_if_sell_now: number;
    profit_pct: number;
  };
  fetched_at: string;
};

export type AmountCalculationResponse = {
  symbol: string;
  company_name: string;
  calculation_mode: "amount";
  input: {
    current_avg_price: number;
    current_quantity: number;
    current_price: number;
    investment_amount: number;
    purchase_price: number;
    calculated_quantity: number;
  };
  result: {
    new_avg_price: number;
    avg_price_change: number;
    avg_price_change_pct: number;
    total_quantity: number;
    total_cost: number;
    additional_cost: number;
    breakeven_price: number;
    profit_if_sell_now: number;
    profit_pct: number;
  };
  fetched_at: string;
};

export type SaveCalculationRequest = {
  symbol: string;
  calculation_mode: "quantity" | "amount";
  input:
    | {
        additional_price: number;
        additional_quantity: number;
      }
    | {
        investment_amount: number;
        purchase_price: number;
      };
  result: {
    new_avg_price: number;
    total_quantity: number;
    total_cost: number;
  };
};

export type SaveCalculationResponse = {
  calculation_id: string;
  symbol: string;
  saved_at: string;
  message: string;
};

export type CalculationHistoryResponse = {
  symbol: string;
  company_name: string;
  total_count: number;
  calculations: Array<{
    calculation_id: string;
    saved_at: string;
    calculation_mode: "quantity" | "amount";
    input:
      | {
          additional_price: number;
          additional_quantity: number;
        }
      | {
          investment_amount: number;
          purchase_price: number;
        };
    result_summary: {
      new_avg_price: number;
      total_quantity: number;
      total_cost: number;
    };
  }>;
};
