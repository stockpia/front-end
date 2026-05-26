export type TradePeriod = "1m" | "3m" | "1y";

export type TradeDetailSummaryMetrics = {
	total_buy_amount: number;
	total_sell_amount: number;
	realized_profit: number;
	eval_profit: number;
	total_profit: number;
	total_profit_rate: number;
	buy_trades: number;
	sell_trades: number;
	total_trades: number;
};

export type TradeDetailStockSummary = {
	symbol: string;
	name: string;
	buy_amount: number;
	sell_amount: number;
	realized_profit: number;
	profit_rate: number;
};

export type TradeDetailTradingTendency = {
	buy_days: number;
	sell_days: number;
	avg_holding_days: number;
};

export type TradeDetailFrequencyChange = {
	buy_frequency: string;
	sell_frequency: string;
};

export type TradeDetailWaterDownPattern = {
	count: number;
	avg_loss_rate: number;
};

export type TradeDetailConcentrationAnalysis = {
	top_stock: string;
	concentration_rate: number;
};

export type TradeDetailVolatilityAnalysis = {
	avg_volatility: number;
	max_volatility_day: string;
};

export type TradeDetailRiskObservation = {
	message: string;
};

export type TradeDetailResponse = {
	scope: string;
	period: TradePeriod;
	actual_period_days: number;
	summary_metrics: TradeDetailSummaryMetrics;
	by_stock_summary: TradeDetailStockSummary[];
	trading_tendency: TradeDetailTradingTendency | null;
	frequency_change: TradeDetailFrequencyChange | null;
	water_down_pattern: TradeDetailWaterDownPattern | null;
	concentration_analysis: TradeDetailConcentrationAnalysis | null;
	volatility_analysis: TradeDetailVolatilityAnalysis | null;
	risk_observation: TradeDetailRiskObservation | null;
	narrative: string | null;
	period_insufficient: boolean;
	period_insufficient_message: string | null;
};
