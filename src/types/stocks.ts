export type StockItem = {
	ticker: string;
	name: string;
	current_price: number;
	change_rate: number;
	volume: number;
	quantity?: number;
	eval_amount?: number;
	profit_rate?: number;
};

export type StocksMarket = "ALL" | "KOSPI" | "KOSDAQ";
export type StocksSort = "change_rate" | "price" | "volume";
export type StocksOrder = "desc" | "asc";
export type StockChartRange = "1d" | "1m" | "3m" | "1y";
export type StockChartType = "candlestick" | "technical" | "line" | "volume";

export type StockSort =
	| "price"
	| "change_rate"
	| "volume"
	| "eval_amount"
	| "profit_rate"
	| "name";

export type StocksListParams = {
	market?: StocksMarket;
	sort?: StocksSort;
	order?: StocksOrder;
};

export type StocksListResponse = {
	market: string;
	sort_by: string;
	order: string;
	count: number;
	stocks: StockItem[];
};

export type StockChartResponse = {
	symbol: string;
	range: StockChartRange;
	type: StockChartType;
	plotly: unknown;
	meta?: {
		ma?: number[];
		generatedAt?: string;
	};
};

export type StockWatchlistResponse = {
	user_id: string;
	count: number;
	stocks: StockItem[];
};
