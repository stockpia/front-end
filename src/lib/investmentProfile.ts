export type InvestmentProfileAnswer = {
	riskTolerance: string;
	expectedReturn: string;
	holdingPeriod: string;
	tradingFrequency: string;
	portfolioStyle: string;
};

export type InvestmentProfileResult = {
	level: 1 | 2 | 3 | 4 | 5;
	name: string;
	score: number;
	feature: string;
	aiPrompt: string;
};

export type InvestmentProfile = {
	answers: InvestmentProfileAnswer;
	result: InvestmentProfileResult;
	updatedAt: string;
};

export type InvestmentProfileOption = {
	value: string;
	label: string;
	score: number;
	description?: string;
};

export type InvestmentProfileQuestion = {
	key: keyof InvestmentProfileAnswer;
	title: string;
	weight: string;
	reason: string;
	options: InvestmentProfileOption[];
};

export const INVESTMENT_PROFILE_STORAGE_KEY = "stockpia.investment-profile";
export const INVESTMENT_PROFILE_EVENT = "stockpia:investment-profile-change";

export const investmentProfileQuestions: InvestmentProfileQuestion[] = [
	{
		key: "riskTolerance",
		title: "Q1. 위험 감내도",
		weight: "40%",
		reason: "포트폴리오 방향성을 결정하는 심리적 방어선",
		options: [
			{ value: "very_conservative", label: "매우 보수적", score: 8 },
			{ value: "conservative", label: "보수적", score: 16 },
			{ value: "balanced", label: "균형", score: 24 },
			{ value: "aggressive", label: "공격적", score: 32 },
			{ value: "very_aggressive", label: "매우 공격적", score: 40 },
		],
	},
	{
		key: "expectedReturn",
		title: "Q2. 1년 기대 수익률",
		weight: "25%",
		reason: "위험 감수 목표를 실제 수익률 기대치로 교차 검증",
		options: [
			{ value: "0_5", label: "0~5%", score: 5 },
			{ value: "6_10", label: "6~10%", score: 10 },
			{ value: "11_20", label: "11~20%", score: 15 },
			{ value: "21_30", label: "21~30%", score: 20 },
			{ value: "31_plus", label: "31% 이상", score: 25 },
		],
	},
	{
		key: "holdingPeriod",
		title: "Q3. 평균 보유 기간",
		weight: "15%",
		reason: "변동성을 견딜 수 있는 시간적 여력",
		options: [
			{ value: "short", label: "단기", score: 15 },
			{ value: "mid", label: "중기", score: 10 },
			{ value: "long", label: "장기", score: 5 },
		],
	},
	{
		key: "tradingFrequency",
		title: "Q4. 매매 빈도",
		weight: "10%",
		reason: "단기 트레이딩 행동 패턴",
		options: [
			{ value: "low", label: "낮음", score: 3 },
			{ value: "normal", label: "보통", score: 6 },
			{ value: "high", label: "잦음", score: 10 },
		],
	},
	{
		key: "portfolioStyle",
		title: "Q5. 포트폴리오 구성",
		weight: "10%",
		reason: "집중 투자에 따른 개별 기업 리스크 노출도",
		options: [
			{ value: "diversified", label: "분산", score: 3 },
			{ value: "balanced", label: "균형", score: 6 },
			{ value: "concentrated", label: "집중", score: 10 },
		],
	},
];

export const investmentProfileResults: InvestmentProfileResult[] = [
	{
		level: 1,
		name: "안정형",
		score: 24,
		feature:
			"원금 손실을 극도로 꺼리며, 은행 예금 수준의 안정성을 최우선으로 합니다.",
		aiPrompt:
			"하방 방어력과 배당 및 실적 안정성을 강조해. 하락장에서는 현금 비중 확대를 최우선으로 제안해.",
	},
	{
		level: 2,
		name: "안정추구형",
		score: 40,
		feature: "약간의 손실을 감수하더라도 시장 평균 수익을 추구합니다.",
		aiPrompt:
			"우량주와 대형주 위주의 흐름을 설명하고, 급등주와 테마주 관련 뉴스는 리스크 경고를 반드시 포함해.",
	},
	{
		level: 3,
		name: "위험중립형",
		score: 55,
		feature: "수익과 위험의 균형을 맞추며 객관적인 시장 데이터를 선호합니다.",
		aiPrompt:
			"팩트 중심적인 시장 분석가 톤을 유지해. 호재와 악재의 비중을 5:5로 다루고 펀더멘털을 철저히 분석해.",
	},
	{
		level: 4,
		name: "적극투자형",
		score: 70,
		feature: "높은 변동성을 기꺼이 감수하며 주도 섹터의 트렌드에 민감합니다.",
		aiPrompt:
			"주도 섹터의 자금 이동과 실적 턴어라운드 모멘텀을 강조하고, 단기 진입 및 청산 기회를 넛지(Nudge)해.",
	},
	{
		level: 5,
		name: "공격투자형",
		score: 85,
		feature: "고위험·고수익을 추구하며 적극적인 모멘텀 투자를 실행합니다.",
		aiPrompt:
			"행동주의적이고 속도감 있는 톤을 사용해. 거래량 급증, 신고가 돌파, 강력한 공시 재료 위주로 브리핑해.",
	},
];

const defaultAnswers: InvestmentProfileAnswer = {
	riskTolerance: "",
	expectedReturn: "",
	holdingPeriod: "",
	tradingFrequency: "",
	portfolioStyle: "",
};

function isBrowser() {
	return typeof window !== "undefined";
}

function notifyInvestmentProfileChange() {
	if (!isBrowser()) {
		return;
	}

	window.dispatchEvent(new Event(INVESTMENT_PROFILE_EVENT));
}

export function createEmptyInvestmentProfileAnswers() {
	return { ...defaultAnswers };
}

export function getInvestmentProfile(): InvestmentProfile | null {
	if (!isBrowser()) {
		return null;
	}

	const raw = window.localStorage.getItem(INVESTMENT_PROFILE_STORAGE_KEY);
	if (!raw) {
		return null;
	}

	try {
		return JSON.parse(raw) as InvestmentProfile;
	} catch {
		window.localStorage.removeItem(INVESTMENT_PROFILE_STORAGE_KEY);
		return null;
	}
}

export function setInvestmentProfile(profile: InvestmentProfile) {
	if (!isBrowser()) {
		return;
	}

	window.localStorage.setItem(
		INVESTMENT_PROFILE_STORAGE_KEY,
		JSON.stringify(profile),
	);
	notifyInvestmentProfileChange();
}

export function subscribeInvestmentProfile(onChange: () => void) {
	if (!isBrowser()) {
		return () => undefined;
	}

	const handleStorage = (event: StorageEvent) => {
		if (event.key === INVESTMENT_PROFILE_STORAGE_KEY) {
			onChange();
		}
	};

	window.addEventListener("storage", handleStorage);
	window.addEventListener(INVESTMENT_PROFILE_EVENT, onChange);

	return () => {
		window.removeEventListener("storage", handleStorage);
		window.removeEventListener(INVESTMENT_PROFILE_EVENT, onChange);
	};
}

export function calculateInvestmentProfileScore(
	answers: InvestmentProfileAnswer,
) {
	return investmentProfileQuestions.reduce((total, question) => {
		const selected = question.options.find(
			(option) => option.value === answers[question.key],
		);
		return total + (selected?.score ?? 0);
	}, 0);
}

export function classifyInvestmentProfile(
	score: number,
): InvestmentProfileResult {
	if (score >= 85) {
		return { ...investmentProfileResults[4], score };
	}
	if (score >= 70) {
		return { ...investmentProfileResults[3], score };
	}
	if (score >= 55) {
		return { ...investmentProfileResults[2], score };
	}
	if (score >= 40) {
		return { ...investmentProfileResults[1], score };
	}
	return { ...investmentProfileResults[0], score };
}

export function createInvestmentProfile(
	answers: InvestmentProfileAnswer,
): InvestmentProfile {
	const score = calculateInvestmentProfileScore(answers);

	return {
		answers,
		result: classifyInvestmentProfile(score),
		updatedAt: new Date().toISOString(),
	};
}

export function isInvestmentProfileComplete(answers: InvestmentProfileAnswer) {
	return investmentProfileQuestions.every((question) => answers[question.key]);
}
