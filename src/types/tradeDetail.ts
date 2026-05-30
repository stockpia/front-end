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
	symbol?: string;  // 구버전 호환 — 백엔드는 ticker 사용
	ticker?: string;
	name: string;
	buy_amount: number;
	sell_amount: number;
	buy_qty?: number;
	sell_qty?: number;
	realized_profit: number;
	profit_rate: number;
	is_top?: boolean;
	is_bottom?: boolean;
};

// 모든 분석 섹션 — 백엔드는 prose `text` 필드를 항상 제공. 개별 필드는 백엔드/
// 프론트 명명이 달라 optional 로 처리 (구버전 호환).

export type TradeDetailTradingTendency = {
	text?: string;
	avg_holding_days?: number;
	category?: string;
	category_range?: string;
	buy_days?: number;
	sell_days?: number;
};

export type TradeDetailFrequencyChange = {
	text?: string;
	buy_frequency?: string;
	sell_frequency?: string;
};

export type TradeDetailWaterDownPattern = {
	text?: string;
	count?: number;
	avg_loss_rate?: number;
};

export type TradeDetailConcentrationAnalysis = {
	text?: string;
	top_stock_name?: string;
	top_stock_ratio?: number;
	category?: string;
	// 구버전 호환
	top_stock?: string;
	concentration_rate?: number;
};

export type TradeDetailVolatilityAnalysis = {
	text?: string;
	volatility_rate?: number;
	max_profit?: number;
	min_profit?: number;
	category?: string;
	// 구버전 호환
	avg_volatility?: number;
	max_volatility_day?: string;
};

export type TradeDetailRiskObservation = {
	text?: string;
	items?: string[];
	// 구버전 호환
	message?: string;
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
	// 백엔드는 dict 형태로 반환 ({flow, pattern, risk_point, observation}) — 구버전
	// 호환 위해 string 도 허용.
	narrative:
		| string
		| {
				flow?: string;
				pattern?: string;
				risk_point?: string;
				observation?: string;
		  }
		| null;
	period_insufficient: boolean;
	period_insufficient_message: string | null;
	demo_mode?: boolean;
	demo_note?: string;
};
