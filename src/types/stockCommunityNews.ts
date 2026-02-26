export type StockCommunityTab = "community";

export type StockCommunitySentiment = "positive" | "neutral" | "negative";

export type StockCommunityItem = {
	id: string;
	title: string;
	content: string;
	url: string;
	source: string;
	sentiment: StockCommunitySentiment;
	published_at: string;
};

export type StockCommunityResponse = {
	symbol: string;
	company_name: string;
	tab: StockCommunityTab;
	page: number;
	limit: number;
	total_count: number;
	has_more: boolean;
	next_cursor?: string | null;
	ai_summary?: string;
	items: StockCommunityItem[];
	fetched_at: string;
	new_count: number;
};

export type StockCommunityLatestResponse = {
	symbol: string;
	items: StockCommunityItem[];
	new_count: number;
	fetched_at: string;
};

export type StockNewsTab = "news";

export type StockNewsItem = {
	id: string;
	title: string;
	content: string;
	url: string;
	source: string;
	published_at: string;
	is_investment_related: boolean;
};

export type StockNewsResponse = {
	symbol: string;
	company_name: string;
	tab: StockNewsTab;
	page: number;
	limit: number;
	total_count: number;
	has_more: boolean;
	next_cursor?: string | null;
	items: StockNewsItem[];
	fetched_at: string;
};

export type StockReportSummary = {
	investment_summary: string;
	current_price: number;
	price_change: number;
	price_change_pct: number;
	return_1m: number;
	return_3m: number;
	return_1y: number;
	per: number;
	pbr: number;
	roe: number;
	rsi: string;
};

export type StockReportInvestmentSummarySection = {
	full_text: string;
	key_points: string[];
	checkpoint: string;
};

export type StockReportPriceTrendSection = {
	returns: {
		"1m": number;
		"3m": number;
		"1y": number;
	};
	technical: {
		rsi: {
			value: number;
			signal: string;
			interpretation: string;
		};
		moving_average: {
			ma5: number;
			ma20: number;
			ma60: number;
			status: string;
			description: string;
		};
		trend: {
			description: string;
		};
	};
};

export type StockReportFinancialAnalysisSection = {
	revenue: unknown[];
	operating_profit: unknown[];
	net_income: unknown[];
	metrics: {
		per: number;
		pbr: number;
		eps: number;
		bps: number;
		roe: number;
	};
	interpretation: string;
	key_points: string[];
};

export type StockReportValuationSection = {
	per: number;
	pbr: number;
	roe: number;
	eps: number;
	interpretation: string;
};

export type StockReportInvestmentOpinionSection = {
	pros: string[];
	cons: string[];
	checkpoints: string[];
	perspective: {
		short_term: string;
		mid_term: string;
		long_term: string;
	};
};

export type StockReportSections = {
	investment_summary: StockReportInvestmentSummarySection;
	price_trend: StockReportPriceTrendSection;
	financial_analysis: StockReportFinancialAnalysisSection;
	valuation: StockReportValuationSection;
	investment_opinion: StockReportInvestmentOpinionSection;
};

export type StockReportResponse = {
	symbol: string;
	company_name: string;
	generated_at: string;
	is_favorite: boolean;
	summary: StockReportSummary;
	sections: StockReportSections;
};
