import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

type BasicInfoStepProps = {
	loginId: string;
	name: string;
	birthDate: string;
	phoneNumber: string;
	password: string;
	onChangeLoginId: (value: string) => void;
	onChangeName: (value: string) => void;
	onChangeBirthDate: (value: string) => void;
	onChangePhoneNumber: (value: string) => void;
	onChangePassword: (value: string) => void;
	onNext: () => void;
};

function formatBirthDateInput(value: string) {
	const digits = value.replace(/\D/g, "").slice(0, 8);
	if (digits.length <= 4) {
		return digits;
	}
	if (digits.length <= 6) {
		return `${digits.slice(0, 4)}-${digits.slice(4)}`;
	}
	return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
}

export default function BasicInfoStep({
	loginId,
	name,
	birthDate,
	phoneNumber,
	password,
	onChangeLoginId,
	onChangeName,
	onChangeBirthDate,
	onChangePhoneNumber,
	onChangePassword,
	onNext,
}: BasicInfoStepProps) {
	const [isPasswordVisible, setIsPasswordVisible] = useState(false);

	// phone 은 선택 — 비워둬도 가입 가능
	const isNextDisabled =
		!loginId.trim() ||
		!name.trim() ||
		!birthDate.trim() ||
		!password.trim();

	return (
		<section className="w-full rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_40px_-32px_rgba(15,23,42,0.6)]">
			<div className="mt-5 space-y-8 text-left">
				<label className="block">
					<span className="mb-1 block text-sm">아이디</span>
					<input
						className="w-full rounded-md border px-3 py-2"
						type="text"
						placeholder="영문/숫자 (예: hanu)"
						autoComplete="username"
						value={loginId}
						onChange={(event) => onChangeLoginId(event.target.value)}
					/>
				</label>
				<label className="block">
					<span className="mb-1 block text-sm">이름</span>
					<input
						className="w-full rounded-md border px-3 py-2"
						type="text"
						placeholder="홍길동"
						value={name}
						onChange={(event) => onChangeName(event.target.value)}
					/>
				</label>
				<label className="block">
					<span className="mb-1 block text-sm">생년월일</span>
					<input
						className="w-full rounded-md border px-3 py-2"
						type="text"
						inputMode="numeric"
						maxLength={10}
						placeholder="1990-01-01"
						value={birthDate}
						onChange={(event) =>
							onChangeBirthDate(formatBirthDateInput(event.target.value))
						}
					/>
				</label>

				<label className="block">
					<span className="mb-1 block text-sm">
						전화번호 <span className="text-xs text-slate-400">(선택)</span>
					</span>
					<input
						className="w-full rounded-md border px-3 py-2"
						type="tel"
						placeholder="01012345678"
						autoComplete="tel"
						value={phoneNumber}
						onChange={(event) => onChangePhoneNumber(event.target.value)}
					/>
				</label>
				<label className="block">
					<span className="mb-1 block text-sm">비밀번호</span>
					<div className="flex w-full items-center rounded-md border px-3 py-2 focus-within:border-slate-400">
						<input
							className="min-w-0 flex-1 border-none p-0 outline-none"
							type={isPasswordVisible ? "text" : "password"}
							placeholder="비밀번호를 입력하세요"
							autoComplete="new-password"
							value={password}
							onChange={(event) => onChangePassword(event.target.value)}
						/>
						<button
							type="button"
							onClick={() => setIsPasswordVisible((prev) => !prev)}
							aria-label={
								isPasswordVisible ? "비밀번호 숨기기" : "비밀번호 보기"
							}
							className="ml-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
						>
							{isPasswordVisible ? (
								<EyeOff className="h-4 w-4" />
							) : (
								<Eye className="h-4 w-4" />
							)}
						</button>
					</div>
				</label>
			</div>
			<div className="mt-6 flex justify-end">
				<button
					type="button"
					onClick={onNext}
					disabled={isNextDisabled}
					className="rounded-lg bg-primary px-5 py-2 font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
				>
					다음
				</button>
			</div>
		</section>
	);
}
