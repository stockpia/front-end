import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ChartPanel, {
	type ChartRange,
	type ChartType,
} from "@/components/ChartPanel";
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
				return "전체 종목";
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

	const searchedStocks = useMemo<StockItem[]>(() => {
		if (!normalizedSearchTerm) {
			return [];
		}

		return stockSearchSocket.results.map((result) => {
			const matchedStock = baseDisplayedStocks.find(
				(stock) => stock.ticker === result.symbol,
			);

			return {
				ticker: result.symbol,
				name: result.name,
				current_price: matchedStock?.current_price ?? 0,
				change_rate: matchedStock?.change_rate ?? 0,
				volume: matchedStock?.volume ?? 0,
				quantity: matchedStock?.quantity,
				eval_amount: matchedStock?.eval_amount,
				profit_rate: matchedStock?.profit_rate,
			};
		});
	}, [baseDisplayedStocks, normalizedSearchTerm, stockSearchSocket.results]);

	const displayedStocks = normalizedSearchTerm
		? searchedStocks
		: baseDisplayedStocks;

	const filteredStocks = useMemo<StockItem[]>(() => {
		if (!normalizedSearchTerm || searchedStocks.length > 0) {
			return displayedStocks;
		}

		// 1) 현재 표시 중인 리스트 (top 30 또는 보유 종목) 에서 부분 일치 우선
		const localMatches = displayedStocks.filter((stock) => {
			const name = stock.name.toLowerCase();
			const ticker = stock.ticker.toLowerCase();
			return (
				name.includes(normalizedSearchTerm) ||
				ticker.includes(normalizedSearchTerm)
			);
		});

		// 2) 보유 탭이거나 로컬 매치가 충분히 있으면 그대로 사용
		if (activeTab === "holding" || localMatches.length > 0) {
			return localMatches;
		}

		// 3) 전체 종목 탭에서 로컬 매치 없을 땐 백엔드 검색 결과 사용
		//    검색 결과는 가격/거래량 정보가 없어 0 으로 채움 (상세 페이지에서 fetch).
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
		if (!stockTickerSocket.ticker) {
			return sortedStocks;
		}

		return sortedStocks.map((stock) =>
			stock.ticker === stockTickerSocket.ticker?.symbol
				? {
						...stock,
						current_price: stockTickerSocket.ticker.price,
						change_rate: stockTickerSocket.ticker.change_rate,
					}
				: stock,
		);
	}, [sortedStocks, stockTickerSocket.ticker]);

	return (
		<div className="space-y-8 py-8">
			<section className="rounded-[24px] border border-slate-200 bg-white px-4 py-4 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.6)]">
				<div className="flex items-center justify-between gap-4">
					<div className="min-w-0">
						<p className="text-sm font-semibold text-slate-900">
							{isSignedIn
								? `${accountSession?.name}님 계좌가 연동되어 있습니다.`
								: "계좌를 연동하면 보유 종목을 불러올 수 있습니다."}
						</p>
						<p className="mt-1 text-sm text-slate-500">
							{isSignedIn
								? accountSession?.accountNumber
								: "한국투자증권 계좌 연동 후 맞춤 데이터를 확인하세요."}
						</p>
					</div>
					{!isSignedIn && (
						<button
							type="button"
							onClick={() => navigate("/login")}
							className="shrink-0 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
						>
							로그인
						</button>
					)}
				</div>
			</section>

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
					tradeTicker={realtimeSelectedStock.ticker}
					tradeName={realtimeSelectedStock.name}
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
