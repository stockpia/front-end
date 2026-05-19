import {
	BellRing,
	MessageCircle,
	ShieldCheck,
	UserRound,
} from "lucide-react";
import { useState } from "react";
import { useAccountSession } from "@/hooks/useAccountSession";

type AccountMode = "mock" | "real";
type BriefingSetting = "marketBriefing" | "weekly";

const briefingOptions: {
	key: BriefingSetting;
	label: string;
	description: string;
}[] = [
	{
		key: "marketBriefing",
		label: "장 시작/마감 브리핑",
		description: "개장 전 주요 이슈와 마감 후 시장 흐름을 받습니다.",
	},
	{
		key: "weekly",
		label: "주간 브리핑",
		description: "한 주의 수익률과 다음 주 체크 포인트를 받습니다.",
	},
];

export default function MyPage() {
	const accountSession = useAccountSession();
	const [briefingSettings, setBriefingSettings] = useState<
		Record<BriefingSetting, boolean>
	>({
		marketBriefing: true,
		weekly: false,
	});
	const [telegramChatId, setTelegramChatId] = useState("");
	const [botToken, setBotToken] = useState("");
	const [name, setName] = useState(accountSession?.name ?? "");
	const [phone, setPhone] = useState(accountSession?.phone ?? "");
	const [email, setEmail] = useState("mate@example.com");
	const [accountMode, setAccountMode] = useState<AccountMode>("mock");
	const accountNumber = accountSession?.accountNumber ?? "연동된 계좌 없음";
	const accountModeLabel = accountMode === "mock" ? "모의" : "실전";

	const handleBriefingChange = (key: BriefingSetting, checked: boolean) => {
		setBriefingSettings((prev) => ({
			...prev,
			[key]: checked,
		}));
	};

	return (
		<div className="space-y-6 py-8">
			<header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_40px_-32px_rgba(15,23,42,0.6)]">
				<p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
					My Page
				</p>
				<h1 className="mt-2 text-2xl font-semibold text-slate-900">
					마이페이지
				</h1>
				<p className="mt-2 text-sm leading-6 text-slate-500">
					알림, 개인 정보, 투자 계좌 환경을 관리할 수 있습니다.
				</p>
			</header>

			<section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_40px_-32px_rgba(15,23,42,0.6)]">
				<SectionTitle
					icon={<BellRing className="h-5 w-5" />}
					title="서비스 설정"
				/>
				<div className="mt-5 grid gap-3">
					{briefingOptions.map((option) => (
						<SquareCheckBox
							key={option.key}
							checked={briefingSettings[option.key]}
							label={option.label}
							description={option.description}
							onChange={(checked) =>
								handleBriefingChange(option.key, checked)
							}
						/>
					))}
				</div>
				<div className="mt-6 border-t border-slate-100 pt-6">
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
							<MessageCircle className="h-5 w-5" />
						</div>
						<h3 className="text-lg font-semibold text-slate-900">
							Telegram 연동 정보
						</h3>
					</div>
					<div className="mt-5 space-y-4">
						<TextField
							label="Telegram Chat ID"
							value={telegramChatId}
							onChange={setTelegramChatId}
							placeholder="Chat ID를 입력하세요"
						/>
						<TextField
							label="Bot Token"
							value={botToken}
							onChange={setBotToken}
							placeholder="Bot Token을 입력하세요"
						/>
					</div>
				</div>
				<div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-6">
					<div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
						<ShieldCheck className="h-5 w-5" />
					</div>
					<h3 className="text-lg font-semibold text-slate-900">계좌 환경</h3>
				</div>
				<div className="mt-5 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1">
					<AccountModeButton
						active={accountMode === "mock"}
						label="모의 계좌"
						onClick={() => setAccountMode("mock")}
					/>
					<AccountModeButton
						active={accountMode === "real"}
						label="실전 계좌"
						onClick={() => setAccountMode("real")}
					/>
				</div>
				<div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3">
					<p className="text-xs font-semibold text-slate-500">
						연동된 {accountModeLabel} 계좌 번호
					</p>
					<p className="mt-1 text-base font-semibold text-slate-900">
						{accountNumber}
					</p>
				</div>
			</section>

			<section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_40px_-32px_rgba(15,23,42,0.6)]">
				<SectionTitle
					icon={<UserRound className="h-5 w-5" />}
					title="개인 정보 수정"
				/>
				<div className="mt-5 space-y-4">
					<TextField label="이름" value={name} onChange={setName} />
					<TextField label="전화번호" value={phone} onChange={setPhone} />
					<TextField label="이메일" value={email} onChange={setEmail} />
				</div>
				<button
					type="button"
					className="mt-5 w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
				>
					변경사항 저장
				</button>
			</section>
		</div>
	);
}

type SectionTitleProps = {
	icon: React.ReactNode;
	title: string;
};

function SectionTitle({ icon, title }: SectionTitleProps) {
	return (
		<div className="flex items-center gap-3">
			<div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
				{icon}
			</div>
			<h2 className="text-lg font-semibold text-slate-900">{title}</h2>
		</div>
	);
}

type SquareCheckBoxProps = {
	checked: boolean;
	label: string;
	description: string;
	onChange: (checked: boolean) => void;
};

function SquareCheckBox({
	checked,
	label,
	description,
	onChange,
}: SquareCheckBoxProps) {
	return (
		<label
			className={`flex items-start justify-between gap-4 rounded-2xl border px-4 py-3 transition ${
				checked
					? "cursor-pointer border-slate-900 bg-slate-50"
					: "cursor-pointer border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
			}`}
		>
			<span className="min-w-0">
				<span className="block text-sm font-semibold text-slate-900">
					{label}
				</span>
				<span className="mt-1 block text-xs leading-5 text-slate-500">
					{description}
				</span>
			</span>
			<span className="mt-0.5 shrink-0">
				<input
					type="checkbox"
					checked={checked}
					onChange={(event) => onChange(event.target.checked)}
					className="sr-only"
				/>
				<span
					className={`flex h-5 w-5 items-center justify-center rounded-md border transition ${
						checked
							? "border-slate-900 bg-slate-900"
							: "border-slate-300 bg-white"
					}`}
				>
					<span
						className={`h-2.5 w-2.5 rounded-[3px] bg-white transition ${
							checked ? "opacity-100" : "opacity-0"
						}`}
					/>
				</span>
			</span>
		</label>
	);
}

type TextFieldProps = {
	label: string;
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
};

function TextField({ label, value, onChange, placeholder }: TextFieldProps) {
	return (
		<label className="block">
			<span className="mb-2 block text-sm font-semibold text-slate-700">
				{label}
			</span>
			<input
				type="text"
				value={value}
				placeholder={placeholder}
				onChange={(event) => onChange(event.target.value)}
				className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-slate-400"
			/>
		</label>
	);
}

type AccountModeButtonProps = {
	active: boolean;
	label: string;
	onClick: () => void;
};

function AccountModeButton({ active, label, onClick }: AccountModeButtonProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
				active
					? "bg-white text-slate-900 shadow-sm"
					: "text-slate-500 hover:text-slate-900"
			}`}
		>
			{label}
		</button>
	);
}
