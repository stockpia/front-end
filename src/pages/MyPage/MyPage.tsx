import { BellRing, ShieldCheck, UserRound } from "lucide-react";
import { useState } from "react";

type AccountMode = "mock" | "real";

export default function MyPage() {
	const [alertEnabled, setAlertEnabled] = useState(true);
	const [name, setName] = useState("홍길동");
	const [phone, setPhone] = useState("010-1234-5678");
	const [email, setEmail] = useState("mate@example.com");
	const [accountMode, setAccountMode] = useState<AccountMode>("mock");

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
				<div className="mt-5">
					<SwitchRow
						title="알림 설정"
						description="투자 전략, 장 마감 요약, 주요 변동 알림을 받아봅니다."
						checked={alertEnabled}
						onChange={setAlertEnabled}
					/>
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
				<p className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600">
					현재 {accountMode === "mock" ? "모의 계좌" : "실전 계좌"} 환경을
					사용 중입니다.
				</p>
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

type SwitchRowProps = {
	title: string;
	description: string;
	checked: boolean;
	onChange: (checked: boolean) => void;
};

function SwitchRow({ title, description, checked, onChange }: SwitchRowProps) {
	return (
		<label className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3">
			<span>
				<span className="block text-sm font-semibold text-slate-900">
					{title}
				</span>
				<span className="mt-1 block text-xs leading-5 text-slate-500">
					{description}
				</span>
			</span>
			<input
				type="checkbox"
				checked={checked}
				onChange={(event) => onChange(event.target.checked)}
				className="h-5 w-5 accent-slate-900"
			/>
		</label>
	);
}

type TextFieldProps = {
	label: string;
	value: string;
	onChange: (value: string) => void;
};

function TextField({ label, value, onChange }: TextFieldProps) {
	return (
		<label className="block">
			<span className="mb-2 block text-sm font-semibold text-slate-700">
				{label}
			</span>
			<input
				type="text"
				value={value}
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
