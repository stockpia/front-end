import {
	ArrowLeft,
	BarChart3,
	ChevronRight,
	Scale,
	ShieldCheck,
	Sparkles,
	TrendingUp,
	Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
	createEmptyInvestmentProfileAnswers,
	createInvestmentProfile,
	investmentProfileQuestions,
	isInvestmentProfileComplete,
	setInvestmentProfile,
	type InvestmentProfileAnswer,
	type InvestmentProfileQuestion,
} from "@/lib/investmentProfile";

export default function InvestmentProfile() {
	const navigate = useNavigate();
	const [answers, setAnswers] = useState<InvestmentProfileAnswer>(
		createEmptyInvestmentProfileAnswers,
	);

	const isComplete = isInvestmentProfileComplete(answers);
	const previewProfile = useMemo(() => {
		if (!isComplete) {
			return null;
		}
		return createInvestmentProfile(answers);
	}, [answers, isComplete]);

	const handleSelect = (key: keyof InvestmentProfileAnswer, value: string) => {
		setAnswers((prev) => ({
			...prev,
			[key]: value,
		}));
	};

	const handleSubmit = () => {
		if (!isComplete) {
			return;
		}

		setInvestmentProfile(createInvestmentProfile(answers));
		navigate("/mypage");
	};

	return (
		<div className="space-y-6 py-8">
			<header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_40px_-32px_rgba(15,23,42,0.6)]">
				<Link
					to="/mypage"
					className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-900"
				>
					<ArrowLeft className="h-4 w-4" />
					마이페이지
				</Link>
				<div className="mt-5 flex items-start gap-4">
					<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white">
						<Sparkles className="h-5 w-5" />
					</div>
					<div className="min-w-0">
						<p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
							Investment Profile
						</p>
						<h1 className="mt-2 text-2xl font-semibold text-slate-900">
							내 투자 성향 설정
						</h1>
						<p className="mt-2 text-sm leading-6 text-slate-500">
							위험 감내도, 기대 수익률, 투자 행동 양식을 바탕으로 AI 리포트가
							사용자 성향에 맞춰 제공되도록 돕습니다.
						</p>
					</div>
				</div>
			</header>

			<section className="space-y-4">
				{investmentProfileQuestions.map((question) => (
					<article
						key={question.key}
						className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_12px_40px_-32px_rgba(15,23,42,0.6)]"
					>
						<div>
							<div>
								<h2 className="text-base font-semibold text-slate-900">
									{question.title}
								</h2>
								<p className="mt-1 text-xs leading-5 text-slate-500">
									{question.reason}
								</p>
							</div>
						</div>

						{question.key === "riskTolerance" ? (
							<NumberScaleQuestion
								question={question}
								value={answers[question.key]}
								onChange={(value) => handleSelect(question.key, value)}
							/>
						) : question.key === "expectedReturn" ? (
							<SliderQuestion
								question={question}
								value={answers[question.key]}
								onChange={(value) => handleSelect(question.key, value)}
							/>
						) : (
							<LikertQuestion
								question={question}
								value={answers[question.key]}
								onChange={(value) => handleSelect(question.key, value)}
							/>
						)}
					</article>
				))}
			</section>

			<section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_40px_-32px_rgba(15,23,42,0.6)]">
				<div className="flex items-start justify-between gap-4">
					<div>
						<p className="text-sm font-semibold text-slate-500">결과</p>
						<h2 className="mt-2 text-2xl font-bold text-slate-900">
							{previewProfile ? (
								<InvestmentProfileResultLabel
									level={previewProfile.result.level}
									name={previewProfile.result.name}
								/>
							) : (
								"모든 문항을 선택해 주세요"
							)}
						</h2>
						<p className="mt-2 text-sm leading-6 text-slate-500">
							{previewProfile
								? previewProfile.result.feature
								: "5개 항목을 모두 선택하면 성향 이름과 점수가 계산됩니다."}
						</p>
					</div>
				</div>
				<button
					type="button"
					disabled={!isComplete}
					onClick={handleSubmit}
					className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
				>
					성향 저장하기
					<ChevronRight className="h-4 w-4" />
				</button>
			</section>
		</div>
	);
}

type InvestmentProfileResultLabelProps = {
	level: 1 | 2 | 3 | 4 | 5;
	name: string;
};

function InvestmentProfileResultLabel({
	level,
	name,
}: InvestmentProfileResultLabelProps) {
	const Icon = getInvestmentProfileIcon(level);

	return (
		<span className="inline-flex items-center gap-2">
			<span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-900 text-white">
				<Icon className="h-5 w-5" />
			</span>
			{name}
		</span>
	);
}

function getInvestmentProfileIcon(level: 1 | 2 | 3 | 4 | 5) {
	switch (level) {
		case 1:
			return ShieldCheck;
		case 2:
			return Scale;
		case 3:
			return BarChart3;
		case 4:
			return TrendingUp;
		case 5:
			return Zap;
	}
}

function NumberScaleQuestion({
	question,
	value,
	onChange,
}: QuestionControlProps) {
	return (
		<div className="mt-5">
			<div className="grid grid-cols-5 overflow-hidden rounded-xl border border-slate-300 bg-white">
				{question.options.map((option, index) => {
					const selected = value === option.value;

					return (
						<button
							key={option.value}
							type="button"
							aria-pressed={selected}
							aria-label={option.label}
							onClick={() => onChange(option.value)}
							className={`h-16 border-slate-300 text-xl font-semibold transition ${
								index === 0 ? "" : "border-l"
							} ${
								selected
									? "bg-slate-900 text-white"
									: "bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-900"
							}`}
						>
							{index + 1}
						</button>
					);
				})}
			</div>
			<div className="mt-3 flex items-center justify-between text-sm font-semibold text-slate-500">
				<span>{question.options[0]?.label}</span>
				<span>{question.options.at(-1)?.label}</span>
			</div>
		</div>
	);
}

type QuestionControlProps = {
	question: InvestmentProfileQuestion;
	value: string;
	onChange: (value: string) => void;
};

function LikertQuestion({ question, value, onChange }: QuestionControlProps) {
	return (
		<div className="mt-5">
			<div
				className={`grid gap-2 ${
					question.options.length === 5
						? "grid-cols-1 sm:grid-cols-5"
						: "grid-cols-3"
				}`}
			>
				{question.options.map((option) => {
					const selected = value === option.value;

					return (
						<button
							key={option.value}
							type="button"
							aria-pressed={selected}
							onClick={() => onChange(option.value)}
							className={`min-h-14 rounded-2xl border px-3 py-3 text-center text-sm font-semibold transition ${
								selected
									? "border-slate-900 bg-slate-900 text-white"
									: "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
							}`}
						>
							{option.label}
						</button>
					);
				})}
			</div>
			<div className="mt-3 flex items-center justify-between text-xs font-semibold text-slate-400">
				<span>{question.options[0]?.label}</span>
				<span>{question.options.at(-1)?.label}</span>
			</div>
		</div>
	);
}

function SliderQuestion({ question, value, onChange }: QuestionControlProps) {
	const selectedIndex = question.options.findIndex(
		(option) => option.value === value,
	);
	const activeIndex = selectedIndex >= 0 ? selectedIndex : 0;
	const activeOption = question.options[activeIndex];

	return (
		<div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5">
			<div className="flex items-center justify-between gap-4">
				<p className="text-sm font-semibold text-slate-500">
					선택한 기대 수익률
				</p>
				<p className="text-base font-bold text-slate-900">
					{selectedIndex >= 0 ? activeOption?.label : "선택 전"}
				</p>
			</div>
			<input
				type="range"
				min={0}
				max={question.options.length - 1}
				step={1}
				value={activeIndex}
				onChange={(event) =>
					onChange(question.options[Number(event.target.value)]?.value ?? "")
				}
				className="mt-5 h-2 w-full cursor-pointer accent-slate-900"
			/>
			<div className="mt-3 grid grid-cols-5 gap-1 text-center text-[11px] font-semibold text-slate-500">
				{question.options.map((option) => (
					<button
						key={option.value}
						type="button"
						onClick={() => onChange(option.value)}
						className={`rounded-lg px-1 py-1 transition ${
							value === option.value
								? "bg-white text-slate-900 shadow-sm"
								: "hover:bg-white hover:text-slate-700"
						}`}
					>
						{option.label}
					</button>
				))}
			</div>
		</div>
	);
}
