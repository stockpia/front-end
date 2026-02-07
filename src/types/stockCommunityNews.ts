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
	ai_summary?: string;
	items: StockCommunityItem[];
	fetched_at: string;
	new_count: number;
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
	items: StockNewsItem[];
	fetched_at: string;
};
