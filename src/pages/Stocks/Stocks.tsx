import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ChartPanel, {
	type ChartRange,
	type ChartType,
} from "@/components/ChartPanel";
import KisStatusBanner from "@/components/KisStatusBanner";
import StockTickerSummary from "@/components/StockTickerSummary";
import { useStockChartQuery } from "@/hooks/queries/useStockChartQuery";
import {
	useHoldingsQuery,
	useStocksListQuery,
} from "@/hooks/queries/useStocksListQueries";
import { useStocksSearchQuery } from "@/hooks/queries/useStocksSearchQuery";
import { useAccountSession } from "@/hooks/useAccountSession";
import { useStockSearchSocket } from "@/hooks/useStockSearchSocket";
import { useStockTickerSocket } from "@/hooks/useStockTickerSocket";
import SearchBar from "@/pages/Stocks/components/SearchBar";
import StocksList from "@/pages/Stocks/components/StocksList";
import StocksTab, { type StockTab } from "@/pages/Stocks/components/StocksTab";
import type { StockItem, StockSort } from "@/types/stocks";

const STOCK_SORT_OPTIONS: { value: StockSort; label: string }[] = [
	// { value: "price", label: "주가순" },
	{ value: "change_rate", label: "상승률순" },
	{ value: "volume", label: "거래량순" },
];

const HOLDING_SORT_OPTIONS: { value: StockSort; label: string }[] = [
	{ value: "eval_amount", label: "평가금액순" },
	{ value: "profit_rate", label: "수익률순" },
	{ value: "name", label: "종목명순" },
];

export default function Stocks() {
	const accountSession = useAccountSession();
	const [activeTab, setActiveTab] = useState<StockTab>("all");
	const [selectedStock, setSelectedStock] = useState<StockItem | null>(null);
	const [userSelectedTicker, setUserSelectedTicker] = useState<string | null>(
		null,
	);
	const [range, setRange] = useState<ChartRange>("1d");
	const [chartType, setChartType] = useState<ChartType>("candlestick");
	const [sortBy, setSortBy] = useState<StockSort>("change_rate");
	const [searchTerm, setSearchTerm] = useState("");
	const [submittedSearchTerm, setSubmittedSearchTerm] = useState("");
	const navigate = useNavigate();
	const userId = accountSession?.userId;
	const isSignedIn = Boolean(userId);

	const listTitle = useMemo(() => {
		switch (activeTab) {
			case "holding":
				return "보유 종목";
			default:
				return "";
		}
	}, [activeTab]);

	const handleTabChange = (nextTab: StockTab) => {
		setActiveTab(nextTab);
		setSortBy(nextTab === "holding" ? "eval_amount" : "change_rate");
	};

	const listSort = ["price", "change_rate", "volume"].includes(sortBy)
		? (sortBy as "price" | "change_rate" | "volume")
		: "change_rate";
	const holdingsSort =
		sortBy === "profit_rate" || sortBy === "name"
			? (sortBy as "profit_rate" | "name")
			: "eval_amount";

	const stocksListQuery = useStocksListQuery({
		market: "ALL",
		sort: listSort,
		order: "desc",
		enabled: activeTab === "all",
	});
	const stocksSearchQuery = useStocksSearchQuery({
		query: submittedSearchTerm,
		enabled: activeTab === "all" && submittedSearchTerm.length > 0,
	});
	const stockSearchSocket = useStockSearchSocket(searchTerm);
	const holdingsQuery = useHoldingsQuery({
		userId,
		sort: holdingsSort,
		order: "desc",
		enabled: activeTab === "holding" && isSignedIn,
	});
	const baseDisplayedStocks = useMemo<StockItem[]>(() => {
		if (activeTab === "holding") {
			return holdingsQuery.holdings.map((stock) => ({
				ticker: stock.ticker,
				name: stock.name,
				current_price: stock.current_price,
				change_rate: stock.profit_rate,
				volume: stock.quantity,
				quantity: stock.quantity,
				eval_amount: stock.eval_amount,
				profit_rate: stock.profit_rate,
			}));
		}

		return stocksListQuery.stocks;
	}, [activeTab, holdingsQuery.holdings, stocksListQuery.stocks]);

	const normalizedSearchTerm = useMemo(
		() => submittedSearchTerm.trim().toLowerCase(),
		[submittedSearchTerm],
	);

	// 전체 탭 검색 결과는 가격 매핑 없이 종목명/ticker 만 표시 (StocksList 가
	// current_price === 0 일 때 '상세 보기 →' 로 렌더). top 20 안의 일부만
	// 가격 보이고 나머지 0% 인 시각적 비대칭 제거 + 사용자 인식 단순화.
	const searchedStocks = useMemo<StockItem[]>(() => {
		if (!normalizedSearchTerm) {
			return [];
		}
		return stockSearchSocket.results.map((result) => ({
			ticker: result.symbol,
			name: result.name,
			current_price: 0,
			change_rate: 0,
			volume: 0,
		}));
	}, [normalizedSearchTerm, stockSearchSocket.results]);

	// 보유 탭은 검색어 있어도 항상 holdings 베이스 유지 (보유 종목 안에서만 부분 일치).
	// 전체 탭은 검색어 있으면 websocket 검색 결과를 베이스로.
	const displayedStocks = useMemo<StockItem[]>(() => {
		if (!normalizedSearchTerm) return baseDisplayedStocks;
		if (activeTab === "holding") return baseDisplayedStocks;
		return searchedStocks;
	}, [normalizedSearchTerm, activeTab, baseDisplayedStocks, searchedStocks]);

	const filteredStocks = useMemo<StockItem[]>(() => {
		if (!normalizedSearchTerm) {
			return displayedStocks;
		}

		// 보유 탭 검색 — holdings 안에서만 부분 일치 (이름/ticker)
		if (activeTab === "holding") {
			return displayedStocks.filter((stock) => {
				const name = stock.name.toLowerCase();
				const ticker = stock.ticker.toLowerCase();
				return (
					name.includes(normalizedSearchTerm) ||
					ticker.includes(normalizedSearchTerm)
				);
			});
		}

		// 전체 탭 검색 — websocket 결과가 있으면 그대로 사용 (가격은 base 에서 매핑)
		if (searchedStocks.length > 0) {
			return displayedStocks;
		}

		// 폴백: 백엔드 REST 검색 (전체 KOSPI/KOSDAQ).
		// 가격/등락률 정보가 없어 0 — StocksList 에서 0 가격 row 는 "상세 보기" 로 표시.
		return stocksSearchQuery.stocks.map((item) => ({
			ticker: item.ticker,
			name: item.name,
			current_price: 0,
			change_rate: 0,
			volume: 0,
		}));
	}, [
		displayedStocks,
		normalizedSearchTerm,
		activeTab,
		stocksSearchQuery.stocks,
		searchedStocks.length,
	]);

	const sortedStocks = useMemo(() => {
		if (activeTab !== "holding") {
			return filteredStocks;
		}

		const sorted = [...filteredStocks];
		switch (sortBy) {
			case "change_rate":
				return sorted.sort((a, b) => b.change_rate - a.change_rate);
			case "volume":
				return sorted.sort((a, b) => b.volume - a.volume);
			case "eval_amount":
				return sorted.sort(
					(a, b) => (b.eval_amount ?? 0) - (a.eval_amount ?? 0),
				);
			case "profit_rate":
				return sorted.sort(
					(a, b) => (b.profit_rate ?? 0) - (a.profit_rate ?? 0),
				);
			case "name":
				return sorted.sort((a, b) => a.name.localeCompare(b.name, "ko"));
			default:
				return sorted.sort((a, b) => b.current_price - a.current_price);
		}
	}, [activeTab, filteredStocks, sortBy]);

	const isLoading = normalizedSearchTerm
		? false
		: activeTab === "holding"
			? holdingsQuery.isLoading
			: stocksListQuery.isLoading;
	const error =
		activeTab === "holding"
			? isSignedIn
				? holdingsQuery.errorMessage
				: null
			: submittedSearchTerm.length > 0
				? stocksSearchQuery.errorMessage
				: stocksListQuery.errorMessage;
	const notice =
		activeTab === "holding" && !isSignedIn
			? "보유 종목은 로그인 후 조회할 수 있습니다."
			: null;

	useEffect(() => {
		setSelectedStock((prev) => {
			if (sortedStocks.length === 0) {
				return null;
			}
			if (!prev) {
				return sortedStocks[0];
			}
			const stillExists = sortedStocks.some(
				(item) => item.ticker === prev.ticker,
			);
			return stillExists ? prev : sortedStocks[0];
		});
		setUserSelectedTicker(null);
	}, [sortedStocks]);

	const effectiveSelectedStock = selectedStock ?? sortedStocks[0] ?? null;
	const selectedSymbol = effectiveSelectedStock?.ticker ?? null;
	const chartQuery = useStockChartQuery({
		symbol: selectedSymbol,
		range,
		type: chartType,
	});
	const stockTickerSocket = useStockTickerSocket(selectedSymbol);
	const realtimeSelectedStock = useMemo(() => {
		if (!effectiveSelectedStock || !stockTickerSocket.ticker) {
			return effectiveSelectedStock;
		}

		return {
			...effectiveSelectedStock,
			current_price: stockTickerSocket.ticker.price,
			change_rate: stockTickerSocket.ticker.change_rate,
		};
	}, [effectiveSelectedStock, stockTickerSocket.ticker]);
	const realtimeSortedStocks = useMemo(() => {
		const base = stockTickerSocket.ticker
			? sortedStocks.map((stock) =>
					stock.ticker === stockTickerSocket.ticker?.symbol
						? {
								...stock,
								current_price: stockTickerSocket.ticker.price,
								change_rate: stockTickerSocket.ticker.change_rate,
							}
						: stock,
				)
			: sortedStocks;

		return activeTab === "all" ? base.slice(0, 20) : base;
	}, [sortedStocks, stockTickerSocket.ticker, activeTab]);

	return (
		<div className="space-y-8 py-8">
			<KisStatusBanner />

			<section className="rounded-[24px] border border-slate-200 bg-white p-3 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.6)] sm:p-5">
				<SearchBar
					value={searchTerm}
					onChange={(value) => {
						setSearchTerm(value);
						if (value.trim().length === 0) {
							setSubmittedSearchTerm("");
						}
					}}
					onSubmit={() => {
						const normalized = searchTerm.trim();
						setSearchTerm(normalized);
						setSubmittedSearchTerm(normalized);
					}}
				/>
				<div className="mt-6">
					<StocksTab value={activeTab} onChange={handleTabChange} />
				</div>
				<div className="mt-6">
					<StocksList
						title={listTitle}
						items={realtimeSortedStocks}
						selectedId={realtimeSelectedStock?.ticker ?? ""}
						onSelect={(item) => {
							if (
								item.ticker === realtimeSelectedStock?.ticker &&
								userSelectedTicker === item.ticker
							) {
								const nameParam = encodeURIComponent(item.name);
								navigate(`/stocks/${item.ticker}?name=${nameParam}`);
								return;
							}
							setSelectedStock(item);
							setUserSelectedTicker(item.ticker);
						}}
						sortBy={sortBy}
						onSortChange={setSortBy}
						sortOptions={
							activeTab === "holding"
								? HOLDING_SORT_OPTIONS
								: STOCK_SORT_OPTIONS
						}
						metaLabel={activeTab === "holding" ? "보유량" : "거래량"}
						rateLabel={activeTab === "holding" ? "수익률" : "당일"}
						isLoading={isLoading}
						error={error}
						notice={notice}
						actionLabel={notice ? "로그인" : undefined}
						onAction={notice ? () => navigate("/login") : undefined}
						secondaryActionLabel={notice ? "회원가입" : undefined}
						onSecondaryAction={
							notice ? () => navigate("/login?mode=signup") : undefined
						}
						emptyLabel={normalizedSearchTerm ? "없는 종목입니다." : undefined}
					/>
				</div>
			</section>

			{realtimeSelectedStock ? (
				<ChartPanel
					symbol={`${realtimeSelectedStock.name} (${realtimeSelectedStock.ticker})`}
					range={range}
					onRangeChange={setRange}
					type={chartType}
					onTypeChange={setChartType}
					loading={Boolean(selectedSymbol) && chartQuery.isLoading}
					error={chartQuery.errorMessage}
					plotlyJson={chartQuery.plotlyJson}
					marketStatus={chartQuery.marketStatus}
					footer={
						<StockTickerSummary
							ticker={stockTickerSocket.ticker}
							fallbackPrice={realtimeSelectedStock.current_price}
							fallbackChangeRate={realtimeSelectedStock.change_rate}
							errorMessage={stockTickerSocket.errorMessage}
							isConnected={stockTickerSocket.isConnected}
						/>
					}
				/>
			) : (
				<ChartPanel
					symbol="선택된 종목"
					range={range}
					onRangeChange={setRange}
					type={chartType}
					onTypeChange={setChartType}
					loading={Boolean(selectedSymbol) && chartQuery.isLoading}
					error={chartQuery.errorMessage}
					plotlyJson={chartQuery.plotlyJson}
					marketStatus={chartQuery.marketStatus}
				/>
			)}

			<button
				type="button"
				onClick={() => navigate(`/trades/${userId ?? "demo_user"}`)}
				className="w-full rounded-[24px] border border-slate-200 bg-white p-4 text-left shadow-[0_20px_60px_-40px_rgba(15,23,42,0.6)] transition hover:border-slate-300 hover:shadow-[0_24px_70px_-42px_rgba(15,23,42,0.7)]"
			>
				<div className="flex items-start justify-between gap-4">
					<div>
						<p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
							My Portfolio
						</p>
						<h2 className="mt-2 text-lg font-semibold text-slate-900">
							내 투자 현황
						</h2>
						<p className="mt-1 text-sm text-slate-500">
							거래 흐름과 상세 리포트를 확인하세요.
						</p>
					</div>
					<span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
						상세 보기
					</span>
				</div>
			</button>
		</div>
	);
}
