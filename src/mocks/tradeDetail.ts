export type TradePeriod = "1m" | "3m" | "1y";

export type TradeScope = {
	id: string;
	label: string;
	ticker?: string;
};

export type TradeRecord = {
	id: string;
	tradeDate: string;
	stockName: string;
	ticker: string;
	type: "매수" | "매도";
	quantity: number;
	price: number;
	amount: number;
	realizedProfit: number;
	holdingDays?: number;
};

export type RangeLabel = {
	label: string;
	range: string;
};

export type DetailedReport = {
	scopeId: string;
	period: TradePeriod;
	periodLabel: string;
	summary: {
		totalTrades: number;
		totalBuyAmount: number;
		totalSellAmount: number;
		realizedProfit: number;
		totalReturnRate: number;
		evaluationProfit?: number;
	};
	holdingTrend: {
		averageHoldingDays: number;
		classification: RangeLabel;
	};
	frequencyChange?: {
		previousTrades: number;
		currentTrades: number;
		changeRate: number;
	};
	averagingPattern?: {
		stockName: string;
		totalBuyCount: number;
		firstAverageBuyPrice: number;
		followupBuyPrices: number[];
	};
	concentration: {
		topStockName: string;
		ratio: number;
		classification: RangeLabel;
	};
	volatility: {
		rate: number;
		classification: RangeLabel;
	};
	riskObservation: string;
	flowSummary: string;
	overallStockSummary?: {
		topStock: { name: string; realizedProfit: number; returnRate: number };
		bottomStock: { name: string; realizedProfit: number; returnRate: number };
	};
	selectedStockSummary?: {
		name: string;
		realizedProfit: number;
		returnRate: number;
	};
	insufficientPeriodNoticeDays?: number;
};

export type AiMessage = {
	role: "assistant" | "user";
	content: string;
};

export const TRADE_PERIOD_OPTIONS: { id: TradePeriod; label: string }[] = [
	{ id: "1m", label: "1달" },
	{ id: "3m", label: "3달" },
	{ id: "1y", label: "1년" },
];

export const TRADE_SCOPE_OPTIONS: TradeScope[] = [
	{ id: "all", label: "전체" },
	{ id: "005930", label: "삼성전자", ticker: "005930" },
	{ id: "000660", label: "SK하이닉스", ticker: "000660" },
	{ id: "035420", label: "NAVER", ticker: "035420" },
];

const TRADE_RECORDS: Record<TradePeriod, TradeRecord[]> = {
	"1m": [
		{
			id: "tr_1m_01",
			tradeDate: "2026-02-28",
			stockName: "삼성전자",
			ticker: "005930",
			type: "매수",
			quantity: 10,
			price: 76000,
			amount: 760000,
			realizedProfit: 0,
		},
		{
			id: "tr_1m_02",
			tradeDate: "2026-02-25",
			stockName: "삼성전자",
			ticker: "005930",
			type: "매수",
			quantity: 10,
			price: 79500,
			amount: 795000,
			realizedProfit: 0,
		},
		{
			id: "tr_1m_03",
			tradeDate: "2026-02-21",
			stockName: "삼성전자",
			ticker: "005930",
			type: "매도",
			quantity: 8,
			price: 80300,
			amount: 642400,
			realizedProfit: -48000,
			holdingDays: 4,
		},
		{
			id: "tr_1m_04",
			tradeDate: "2026-02-18",
			stockName: "SK하이닉스",
			ticker: "000660",
			type: "매수",
			quantity: 5,
			price: 182000,
			amount: 910000,
			realizedProfit: 0,
		},
		{
			id: "tr_1m_05",
			tradeDate: "2026-02-15",
			stockName: "NAVER",
			ticker: "035420",
			type: "매수",
			quantity: 6,
			price: 224000,
			amount: 1344000,
			realizedProfit: 0,
		},
		{
			id: "tr_1m_06",
			tradeDate: "2026-02-11",
			stockName: "SK하이닉스",
			ticker: "000660",
			type: "매도",
			quantity: 3,
			price: 185500,
			amount: 556500,
			realizedProfit: 22000,
			holdingDays: 6,
		},
		{
			id: "tr_1m_07",
			tradeDate: "2026-02-06",
			stockName: "삼성전자",
			ticker: "005930",
			type: "매수",
			quantity: 12,
			price: 82000,
			amount: 984000,
			realizedProfit: 0,
		},
		{
			id: "tr_1m_08",
			tradeDate: "2026-02-04",
			stockName: "NAVER",
			ticker: "035420",
			type: "매도",
			quantity: 2,
			price: 219000,
			amount: 438000,
			realizedProfit: -16000,
			holdingDays: 8,
		},
		{
			id: "tr_1m_09",
			tradeDate: "2026-02-01",
			stockName: "삼성전자",
			ticker: "005930",
			type: "매수",
			quantity: 8,
			price: 82400,
			amount: 659200,
			realizedProfit: 0,
		},
	],
	"3m": [
		{
			id: "tr_3m_01",
			tradeDate: "2026-02-28",
			stockName: "삼성전자",
			ticker: "005930",
			type: "매수",
			quantity: 10,
			price: 76000,
			amount: 760000,
			realizedProfit: 0,
		},
		{
			id: "tr_3m_02",
			tradeDate: "2026-02-21",
			stockName: "삼성전자",
			ticker: "005930",
			type: "매도",
			quantity: 8,
			price: 80300,
			amount: 642400,
			realizedProfit: -48000,
			holdingDays: 4,
		},
		{
			id: "tr_3m_03",
			tradeDate: "2026-02-18",
			stockName: "SK하이닉스",
			ticker: "000660",
			type: "매수",
			quantity: 5,
			price: 182000,
			amount: 910000,
			realizedProfit: 0,
		},
		{
			id: "tr_3m_04",
			tradeDate: "2026-02-11",
			stockName: "SK하이닉스",
			ticker: "000660",
			type: "매도",
			quantity: 3,
			price: 185500,
			amount: 556500,
			realizedProfit: 22000,
			holdingDays: 6,
		},
		{
			id: "tr_3m_05",
			tradeDate: "2026-02-06",
			stockName: "삼성전자",
			ticker: "005930",
			type: "매수",
			quantity: 12,
			price: 82000,
			amount: 984000,
			realizedProfit: 0,
		},
		{
			id: "tr_3m_06",
			tradeDate: "2026-01-29",
			stockName: "NAVER",
			ticker: "035420",
			type: "매수",
			quantity: 7,
			price: 220500,
			amount: 1543500,
			realizedProfit: 0,
		},
		{
			id: "tr_3m_07",
			tradeDate: "2026-01-20",
			stockName: "NAVER",
			ticker: "035420",
			type: "매도",
			quantity: 4,
			price: 228000,
			amount: 912000,
			realizedProfit: 45000,
			holdingDays: 12,
		},
		{
			id: "tr_3m_08",
			tradeDate: "2025-12-18",
			stockName: "삼성전자",
			ticker: "005930",
			type: "매수",
			quantity: 10,
			price: 83500,
			amount: 835000,
			realizedProfit: 0,
		},
		{
			id: "tr_3m_09",
			tradeDate: "2025-12-05",
			stockName: "SK하이닉스",
			ticker: "000660",
			type: "매수",
			quantity: 4,
			price: 176000,
			amount: 704000,
			realizedProfit: 0,
		},
	],
	"1y": [
		{
			id: "tr_1y_01",
			tradeDate: "2026-02-28",
			stockName: "삼성전자",
			ticker: "005930",
			type: "매수",
			quantity: 10,
			price: 76000,
			amount: 760000,
			realizedProfit: 0,
		},
		{
			id: "tr_1y_02",
			tradeDate: "2026-02-21",
			stockName: "삼성전자",
			ticker: "005930",
			type: "매도",
			quantity: 8,
			price: 80300,
			amount: 642400,
			realizedProfit: -48000,
			holdingDays: 4,
		},
		{
			id: "tr_1y_03",
			tradeDate: "2026-02-11",
			stockName: "SK하이닉스",
			ticker: "000660",
			type: "매도",
			quantity: 3,
			price: 185500,
			amount: 556500,
			realizedProfit: 22000,
			holdingDays: 6,
		},
		{
			id: "tr_1y_04",
			tradeDate: "2026-01-20",
			stockName: "NAVER",
			ticker: "035420",
			type: "매도",
			quantity: 4,
			price: 228000,
			amount: 912000,
			realizedProfit: 45000,
			holdingDays: 12,
		},
		{
			id: "tr_1y_05",
			tradeDate: "2025-11-14",
			stockName: "삼성전자",
			ticker: "005930",
			type: "매도",
			quantity: 15,
			price: 84500,
			amount: 1267500,
			realizedProfit: 86000,
			holdingDays: 18,
		},
		{
			id: "tr_1y_06",
			tradeDate: "2025-09-30",
			stockName: "SK하이닉스",
			ticker: "000660",
			type: "매수",
			quantity: 7,
			price: 170000,
			amount: 1190000,
			realizedProfit: 0,
		},
		{
			id: "tr_1y_07",
			tradeDate: "2025-07-22",
			stockName: "NAVER",
			ticker: "035420",
			type: "매수",
			quantity: 9,
			price: 210000,
			amount: 1890000,
			realizedProfit: 0,
		},
	],
};

const REPORTS: Record<TradePeriod, Record<string, DetailedReport>> = {
	"1m": {
		all: {
			scopeId: "all",
			period: "1m",
			periodLabel: "최근 1개월",
			summary: {
				totalTrades: 9,
				totalBuyAmount: 12400000,
				totalSellAmount: 10900000,
				realizedProfit: -320000,
				totalReturnRate: -2.6,
				evaluationProfit: 180000,
			},
			holdingTrend: {
				averageHoldingDays: 5.2,
				classification: { label: "단기 매매 성향", range: "7일 이하" },
			},
			frequencyChange: {
				previousTrades: 5,
				currentTrades: 9,
				changeRate: 80,
			},
			averagingPattern: {
				stockName: "삼성전자",
				totalBuyCount: 4,
				firstAverageBuyPrice: 82000,
				followupBuyPrices: [79500, 76000],
			},
			concentration: {
				topStockName: "삼성전자",
				ratio: 58,
				classification: { label: "높은 집중 구조", range: "50~70%" },
			},
			volatility: {
				rate: 18,
				classification: { label: "높은 변동 구간", range: "15% 이상" },
			},
			riskObservation:
				"평균 보유일은 5.2일로 단기 구간(7일 이하)이며, 상위 1종목 비중은 58%로 높은 집중 구간(50~70%)입니다. 손익 변동률은 18%로 높은 변동 구간(15% 이상)에 해당합니다.",
			flowSummary:
				"최근 1개월 기준 총 9회 거래 중 매수 6회, 매도 3회가 기록되었습니다. 총 매수 12,400,000원 대비 총 매도 10,900,000원으로 집계되었습니다.",
			overallStockSummary: {
				topStock: {
					name: "SK하이닉스",
					realizedProfit: 22000,
					returnRate: 1.8,
				},
				bottomStock: {
					name: "삼성전자",
					realizedProfit: -280000,
					returnRate: -3.4,
				},
			},
		},
		"005930": {
			scopeId: "005930",
			period: "1m",
			periodLabel: "최근 1개월",
			summary: {
				totalTrades: 5,
				totalBuyAmount: 3198200,
				totalSellAmount: 642400,
				realizedProfit: -48000,
				totalReturnRate: -1.5,
			},
			holdingTrend: {
				averageHoldingDays: 4.0,
				classification: { label: "단기 매매 성향", range: "7일 이하" },
			},
			concentration: {
				topStockName: "삼성전자",
				ratio: 100,
				classification: { label: "매우 높은 집중 구조", range: "70% 이상" },
			},
			volatility: {
				rate: 11,
				classification: { label: "중간 변동 구간", range: "5~15%" },
			},
			riskObservation:
				"평균 보유일은 4.0일로 단기 구간(7일 이하)이며, 단일 종목 선택 상태에서 종목 비중은 100%입니다.",
			flowSummary:
				"최근 1개월 기준 삼성전자 거래는 5회이며, 매수 4회와 매도 1회로 구성되었습니다.",
			selectedStockSummary: {
				name: "삼성전자",
				realizedProfit: -48000,
				returnRate: -1.5,
			},
		},
		"000660": {
			scopeId: "000660",
			period: "1m",
			periodLabel: "최근 1개월",
			summary: {
				totalTrades: 2,
				totalBuyAmount: 910000,
				totalSellAmount: 556500,
				realizedProfit: 22000,
				totalReturnRate: 2.4,
			},
			holdingTrend: {
				averageHoldingDays: 6.0,
				classification: { label: "단기 매매 성향", range: "7일 이하" },
			},
			concentration: {
				topStockName: "SK하이닉스",
				ratio: 100,
				classification: { label: "매우 높은 집중 구조", range: "70% 이상" },
			},
			volatility: {
				rate: 7,
				classification: { label: "중간 변동 구간", range: "5~15%" },
			},
			riskObservation:
				"평균 보유일은 6.0일로 단기 구간(7일 이하)이며, 단일 종목 선택 상태에서 종목 비중은 100%입니다.",
			flowSummary:
				"최근 1개월 기준 SK하이닉스 거래는 2회이며, 매수 1회와 매도 1회가 기록되었습니다.",
			selectedStockSummary: {
				name: "SK하이닉스",
				realizedProfit: 22000,
				returnRate: 2.4,
			},
		},
		"035420": {
			scopeId: "035420",
			period: "1m",
			periodLabel: "최근 1개월",
			summary: {
				totalTrades: 2,
				totalBuyAmount: 1344000,
				totalSellAmount: 438000,
				realizedProfit: -16000,
				totalReturnRate: -1.2,
			},
			holdingTrend: {
				averageHoldingDays: 8.0,
				classification: { label: "중기 매매 성향", range: "8~29일" },
			},
			concentration: {
				topStockName: "NAVER",
				ratio: 100,
				classification: { label: "매우 높은 집중 구조", range: "70% 이상" },
			},
			volatility: {
				rate: 9,
				classification: { label: "중간 변동 구간", range: "5~15%" },
			},
			riskObservation:
				"평균 보유일은 8.0일로 중기 구간(8~29일)이며, 단일 종목 선택 상태에서 종목 비중은 100%입니다.",
			flowSummary:
				"최근 1개월 기준 NAVER 거래는 2회이며, 매수 1회와 매도 1회가 기록되었습니다.",
			selectedStockSummary: {
				name: "NAVER",
				realizedProfit: -16000,
				returnRate: -1.2,
			},
		},
	},
	"3m": {
		all: {
			scopeId: "all",
			period: "3m",
			periodLabel: "최근 3개월",
			summary: {
				totalTrades: 18,
				totalBuyAmount: 26740000,
				totalSellAmount: 24180000,
				realizedProfit: 410000,
				totalReturnRate: 1.5,
			},
			holdingTrend: {
				averageHoldingDays: 9.8,
				classification: { label: "중기 매매 성향", range: "8~29일" },
			},
			frequencyChange: {
				previousTrades: 13,
				currentTrades: 18,
				changeRate: 38.5,
			},
			concentration: {
				topStockName: "삼성전자",
				ratio: 52,
				classification: { label: "높은 집중 구조", range: "50~70%" },
			},
			volatility: {
				rate: 14,
				classification: { label: "중간 변동 구간", range: "5~15%" },
			},
			riskObservation:
				"상위 1종목 비중은 52%로 높은 집중 구간(50~70%)에 해당합니다.",
			flowSummary:
				"최근 3개월 기준 총 18회 거래가 집계되었고, 매수 비중은 61.1%(11회)입니다.",
			overallStockSummary: {
				topStock: { name: "NAVER", realizedProfit: 210000, returnRate: 3.1 },
				bottomStock: {
					name: "삼성전자",
					realizedProfit: -120000,
					returnRate: -0.8,
				},
			},
		},
		"005930": {
			scopeId: "005930",
			period: "3m",
			periodLabel: "최근 3개월",
			summary: {
				totalTrades: 8,
				totalBuyAmount: 6420000,
				totalSellAmount: 3890000,
				realizedProfit: -86000,
				totalReturnRate: -1.3,
			},
			holdingTrend: {
				averageHoldingDays: 6.3,
				classification: { label: "단기 매매 성향", range: "7일 이하" },
			},
			concentration: {
				topStockName: "삼성전자",
				ratio: 100,
				classification: { label: "매우 높은 집중 구조", range: "70% 이상" },
			},
			volatility: {
				rate: 10,
				classification: { label: "중간 변동 구간", range: "5~15%" },
			},
			riskObservation: "평균 보유일은 6.3일로 단기 구간(7일 이하)입니다.",
			flowSummary:
				"최근 3개월 기준 삼성전자 거래는 8회이며, 실현손익은 -86,000원입니다.",
			selectedStockSummary: {
				name: "삼성전자",
				realizedProfit: -86000,
				returnRate: -1.3,
			},
		},
		"000660": {
			scopeId: "000660",
			period: "3m",
			periodLabel: "최근 3개월",
			summary: {
				totalTrades: 5,
				totalBuyAmount: 2804000,
				totalSellAmount: 2152000,
				realizedProfit: 118000,
				totalReturnRate: 4.2,
			},
			holdingTrend: {
				averageHoldingDays: 11.0,
				classification: { label: "중기 매매 성향", range: "8~29일" },
			},
			concentration: {
				topStockName: "SK하이닉스",
				ratio: 100,
				classification: { label: "매우 높은 집중 구조", range: "70% 이상" },
			},
			volatility: {
				rate: 13,
				classification: { label: "중간 변동 구간", range: "5~15%" },
			},
			riskObservation:
				"단일 종목 선택 상태에서 종목 비중은 100%이며, 손익 변동률은 13%입니다.",
			flowSummary:
				"최근 3개월 기준 SK하이닉스 거래는 5회이며, 실현손익은 118,000원입니다.",
			selectedStockSummary: {
				name: "SK하이닉스",
				realizedProfit: 118000,
				returnRate: 4.2,
			},
		},
		"035420": {
			scopeId: "035420",
			period: "3m",
			periodLabel: "최근 3개월",
			summary: {
				totalTrades: 5,
				totalBuyAmount: 3980000,
				totalSellAmount: 3770000,
				realizedProfit: 90000,
				totalReturnRate: 2.2,
			},
			holdingTrend: {
				averageHoldingDays: 17.4,
				classification: { label: "중기 매매 성향", range: "8~29일" },
			},
			concentration: {
				topStockName: "NAVER",
				ratio: 100,
				classification: { label: "매우 높은 집중 구조", range: "70% 이상" },
			},
			volatility: {
				rate: 8,
				classification: { label: "중간 변동 구간", range: "5~15%" },
			},
			riskObservation: "평균 보유일은 17.4일로 중기 구간(8~29일)입니다.",
			flowSummary:
				"최근 3개월 기준 NAVER 거래는 5회이며, 실현손익은 90,000원입니다.",
			selectedStockSummary: {
				name: "NAVER",
				realizedProfit: 90000,
				returnRate: 2.2,
			},
		},
	},
	"1y": {
		all: {
			scopeId: "all",
			period: "1y",
			periodLabel: "최근 1년",
			summary: {
				totalTrades: 24,
				totalBuyAmount: 36200000,
				totalSellAmount: 34150000,
				realizedProfit: 620000,
				totalReturnRate: 1.7,
			},
			holdingTrend: {
				averageHoldingDays: 16.2,
				classification: { label: "중기 매매 성향", range: "8~29일" },
			},
			concentration: {
				topStockName: "삼성전자",
				ratio: 48,
				classification: { label: "중간 집중 구조", range: "30~50%" },
			},
			volatility: {
				rate: 12,
				classification: { label: "중간 변동 구간", range: "5~15%" },
			},
			riskObservation:
				"상위 1종목 비중은 48%로 중간 집중 구간(30~50%)이며, 손익 변동률은 12%입니다.",
			flowSummary:
				"최근 1년 기준 총 24회 거래가 집계되었습니다. 실현손익은 620,000원입니다.",
			overallStockSummary: {
				topStock: {
					name: "SK하이닉스",
					realizedProfit: 360000,
					returnRate: 5.8,
				},
				bottomStock: {
					name: "삼성전자",
					realizedProfit: -40000,
					returnRate: -0.3,
				},
			},
			insufficientPeriodNoticeDays: 240,
		},
		"005930": {
			scopeId: "005930",
			period: "1y",
			periodLabel: "최근 1년",
			summary: {
				totalTrades: 11,
				totalBuyAmount: 11200000,
				totalSellAmount: 10150000,
				realizedProfit: -40000,
				totalReturnRate: -0.3,
			},
			holdingTrend: {
				averageHoldingDays: 13.0,
				classification: { label: "중기 매매 성향", range: "8~29일" },
			},
			concentration: {
				topStockName: "삼성전자",
				ratio: 100,
				classification: { label: "매우 높은 집중 구조", range: "70% 이상" },
			},
			volatility: {
				rate: 9,
				classification: { label: "중간 변동 구간", range: "5~15%" },
			},
			riskObservation:
				"단일 종목 선택 상태에서 종목 비중은 100%입니다. 평균 보유일은 13.0일입니다.",
			flowSummary:
				"최근 1년 기준 삼성전자 거래는 11회이며, 실현손익은 -40,000원입니다.",
			selectedStockSummary: {
				name: "삼성전자",
				realizedProfit: -40000,
				returnRate: -0.3,
			},
			insufficientPeriodNoticeDays: 240,
		},
		"000660": {
			scopeId: "000660",
			period: "1y",
			periodLabel: "최근 1년",
			summary: {
				totalTrades: 7,
				totalBuyAmount: 6980000,
				totalSellAmount: 7210000,
				realizedProfit: 360000,
				totalReturnRate: 5.2,
			},
			holdingTrend: {
				averageHoldingDays: 21.5,
				classification: { label: "중기 매매 성향", range: "8~29일" },
			},
			concentration: {
				topStockName: "SK하이닉스",
				ratio: 100,
				classification: { label: "매우 높은 집중 구조", range: "70% 이상" },
			},
			volatility: {
				rate: 16,
				classification: { label: "높은 변동 구간", range: "15% 이상" },
			},
			riskObservation:
				"손익 변동률은 16%로 높은 변동 구간(15% 이상)에 해당합니다.",
			flowSummary:
				"최근 1년 기준 SK하이닉스 거래는 7회이며, 실현손익은 360,000원입니다.",
			selectedStockSummary: {
				name: "SK하이닉스",
				realizedProfit: 360000,
				returnRate: 5.2,
			},
			insufficientPeriodNoticeDays: 240,
		},
		"035420": {
			scopeId: "035420",
			period: "1y",
			periodLabel: "최근 1년",
			summary: {
				totalTrades: 6,
				totalBuyAmount: 6320000,
				totalSellAmount: 6790000,
				realizedProfit: 300000,
				totalReturnRate: 4.7,
			},
			holdingTrend: {
				averageHoldingDays: 27.0,
				classification: { label: "중기 매매 성향", range: "8~29일" },
			},
			concentration: {
				topStockName: "NAVER",
				ratio: 100,
				classification: { label: "매우 높은 집중 구조", range: "70% 이상" },
			},
			volatility: {
				rate: 13,
				classification: { label: "중간 변동 구간", range: "5~15%" },
			},
			riskObservation: "평균 보유일은 27.0일로 중기 구간(8~29일)입니다.",
			flowSummary:
				"최근 1년 기준 NAVER 거래는 6회이며, 실현손익은 300,000원입니다.",
			selectedStockSummary: {
				name: "NAVER",
				realizedProfit: 300000,
				returnRate: 4.7,
			},
			insufficientPeriodNoticeDays: 240,
		},
	},
};

export const AI_WELCOME_MESSAGE: AiMessage = {
	role: "assistant",
	content:
		"안녕하세요, 주토피아 AI입니다 :) 상세 리포트 내용에 대해 궁금한 점이 있다면 질문해 주세요.",
};

export const AI_SUGGESTED_QUESTIONS: string[] = [
	"실현손익이랑 평가손익 차이가 뭐야?",
	"평균 보유일 기준은 어떻게 계산돼?",
	"종목 집중도 구간 기준 알려줘",
	"이번 기간 거래 횟수 변화 설명해줘",
	"손익 변동률 계산 방식이 뭐야?",
	"물타기 판단 기준은 뭐야?",
];

const AI_ANSWER_TEMPLATE: Record<string, string> = {
	"실현손익이랑 평가손익 차이가 뭐야?":
		"실현손익은 매도 체결로 확정된 손익이고, 평가손익은 보유 중인 종목을 현재가로 평가한 손익입니다. 이번 리포트의 실현손익은 매도 거래만 반영됩니다.",
	"평균 보유일 기준은 어떻게 계산돼?":
		"평균 보유일은 각 매도 거래의 보유일 합계를 매도 건수로 나눠 계산합니다. 분류 기준은 7일 이하 단기, 8~29일 중기, 30일 이상 장기입니다.",
	"종목 집중도 구간 기준 알려줘":
		"상위 1종목 비중은 해당 종목 매수 금액을 전체 매수 금액으로 나눈 값입니다. 구간은 0~30% 분산, 30~50% 중간 집중, 50~70% 높은 집중, 70% 이상 매우 높은 집중입니다.",
	"이번 기간 거래 횟수 변화 설명해줘":
		"거래 횟수 변화율은 (이번 기간 거래 횟수 - 이전 기간 거래 횟수) / 이전 기간 거래 횟수로 계산합니다. 절대 변화율이 20% 이상일 때만 변화 블록이 표시됩니다.",
	"손익 변동률 계산 방식이 뭐야?":
		"손익 변동률은 기간 중 최대 손익과 최소 손익의 차이를 평균 투자금으로 나눠 계산합니다. 5% 미만 낮은 변동, 5~15% 중간 변동, 15% 이상 높은 변동으로 구분합니다.",
	"물타기 판단 기준은 뭐야?":
		"물타기 조건은 동일 종목 매수 3회 이상이며 이후 매수 가격이 최초 평균 매수 가격보다 낮은 경우입니다. 조건 충족 시 물타기 패턴 블록이 표시됩니다.",
};

export function getTradeRecords(
	scopeId: string,
	period: TradePeriod,
): TradeRecord[] {
	const list = TRADE_RECORDS[period];
	if (scopeId === "all") {
		return list;
	}
	return list.filter((trade) => trade.ticker === scopeId);
}

export function getDetailedReport(
	scopeId: string,
	period: TradePeriod,
): DetailedReport {
	const currentPeriodReports = REPORTS[period];
	return currentPeriodReports[scopeId] ?? currentPeriodReports.all;
}

export function buildAiAnswer(
	question: string,
	report: DetailedReport,
): string {
	const baseAnswer =
		AI_ANSWER_TEMPLATE[question] ??
		"현재 리포트 기준 수치와 구간 정의를 바탕으로 설명할 수 있습니다.";

	const summaryLine = `현재 선택 기준(${report.scopeId === "all" ? "전체" : (report.selectedStockSummary?.name ?? report.scopeId)} · ${report.periodLabel})에서 평균 보유일 ${report.holdingTrend.averageHoldingDays}일, 상위 비중 ${report.concentration.ratio}%, 손익 변동률 ${report.volatility.rate}%입니다.`;

	const rangeLine = `구간 기준으로는 ${report.holdingTrend.classification.label}(${report.holdingTrend.classification.range}), ${report.concentration.classification.label}(${report.concentration.classification.range}), ${report.volatility.classification.label}(${report.volatility.classification.range})에 해당합니다.`;

	const shortageLine = report.insufficientPeriodNoticeDays
		? `선택 기간 대비 거래내역이 부족하여 최근 ${report.insufficientPeriodNoticeDays}일 데이터 기준으로 설명하고 있어요.`
		: "";

	return [baseAnswer, summaryLine, rangeLine, shortageLine]
		.filter(Boolean)
		.join("\n\n");
}
