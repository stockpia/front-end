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
import { useAccountSession } from "@/hooks/useAccountSession";
import { useStockTickerSocket } from "@/hooks/useStockTickerSocket";
import { clearAccountSession } from "@/lib/auth/session";
import { queryClient } from "@/lib/query/queryClient";
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
	const holdingsQuery = useHoldingsQuery({
		userId,
		sort: holdingsSort,
		order: "desc",
		enabled: activeTab === "holding" && isSignedIn,
	});
	const handleSignout = async () => {
		clearAccountSession();
		await queryClient.invalidateQueries();
		navigate("/login");
	};

	const displayedStocks = useMemo<StockItem[]>(() => {
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
		() => searchTerm.trim().toLowerCase(),
		[searchTerm],
	);

	const filteredStocks = useMemo(() => {
		if (!normalizedSearchTerm) {
			return displayedStocks;
		}

		return displayedStocks.filter((stock) => {
			const name = stock.name.toLowerCase();
			const ticker = stock.ticker.toLowerCase();
			return name === normalizedSearchTerm || ticker === normalizedSearchTerm;
		});
	}, [displayedStocks, normalizedSearchTerm]);

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

	const isLoading =
		activeTab === "holding"
			? holdingsQuery.isLoading
			: stocksListQuery.isLoading;
	const error =
		activeTab === "holding"
			? isSignedIn
				? holdingsQuery.errorMessage
				: null
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
			<section className="rounded-[28px] border border-slate-200 bg-white px-5 py-4 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.6)]">
				<div className="flex items-center justify-between gap-4">
					<div>
						<p className="text-sm font-semibold text-slate-900">
							{isSignedIn
								? `${accountSession?.name}님 계좌가 연동되어 있습니다.`
								: "계좌를 연동하면 보유 종목을 불러올 수 있습니다."}
						</p>
						<p className="mt-1 text-sm text-slate-500">
							{isSignedIn
								? `${accountSession?.accountNumber} / ${userId}`
								: "한국투자증권 계좌 연동 후 맞춤 데이터를 확인하세요."}
						</p>
					</div>
					<button
						type="button"
						onClick={() => {
							if (isSignedIn) {
								void handleSignout();
								return;
							}
							navigate("/login");
						}}
						className="shrink-0 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
					>
						{isSignedIn ? "로그아웃" : "로그인"}
					</button>
				</div>
			</section>

			<section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.6)]">
				<SearchBar
					value={searchTerm}
					onChange={setSearchTerm}
					onSubmit={() => {
						const normalized = searchTerm.trim();
						setSearchTerm(normalized);
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
						onSecondaryAction={notice ? () => navigate("/login?mode=signup") : undefined}
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
				className="w-full rounded-[28px] border border-slate-200 bg-white p-5 text-left shadow-[0_20px_60px_-40px_rgba(15,23,42,0.6)] transition hover:border-slate-300 hover:shadow-[0_24px_70px_-42px_rgba(15,23,42,0.7)]"
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
