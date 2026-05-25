import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { signupAccount } from "@/lib/api/accounts";
import { setAccountSession } from "@/lib/auth/session";

type BasicInfoStepProps = {
	name: string;
	birthDate: string;
	phoneNumber: string;
	password: string;
	onChangeName: (value: string) => void;
	onChangeBirthDate: (value: string) => void;
	onChangePhoneNumber: (value: string) => void;
	onChangePassword: (value: string) => void;
	onSignupSuccess: (userId: string) => void;
};

function toErrorMessage(error: unknown) {
	if (isAxiosError<{ error?: string; detail?: string }>(error)) {
		const { error: message, detail } = error.response?.data ?? {};
		return [message, detail].filter(Boolean).join(" ") || error.message;
	}

	return error instanceof Error
		? error.message
		: "회원가입 중 오류가 발생했습니다.";
}

export default function BasicInfoStep({
	name,
	birthDate,
	phoneNumber,
	password,
	onChangeName,
	onChangeBirthDate,
	onChangePhoneNumber,
	onChangePassword,
	onSignupSuccess,
}: BasicInfoStepProps) {
	const signupMutation = useMutation({
		mutationFn: signupAccount,
		onSuccess: (response, variables) => {
			setAccountSession({
				userId: response.user_id,
				name: variables.name,
				phone: variables.phone,
			});
			onSignupSuccess(response.user_id);
		},
	});

	const isNextDisabled =
		!name.trim() ||
		!birthDate.trim() ||
		!phoneNumber.trim() ||
		!password.trim() ||
		signupMutation.isPending;

	const handleNext = () => {
		signupMutation.mutate({
			name: name.trim(),
			birthdate: birthDate.trim(),
			phone: phoneNumber.trim(),
			password,
		});
	};

	const errorMessage = signupMutation.isError
		? toErrorMessage(signupMutation.error)
		: null;

	return (
		<section className="w-full rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_40px_-32px_rgba(15,23,42,0.6)]">
			<div className="mt-5 space-y-8 text-left">
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
						placeholder="19900101"
						value={birthDate}
						onChange={(event) => onChangeBirthDate(event.target.value)}
					/>
				</label>

				<label className="block">
					<span className="mb-1 block text-sm">전화번호</span>
					<input
						className="w-full rounded-md border px-3 py-2"
						type="tel"
						placeholder="01012345678"
						value={phoneNumber}
						onChange={(event) => onChangePhoneNumber(event.target.value)}
					/>
				</label>

				<label className="block">
					<span className="mb-1 block text-sm">비밀번호</span>
					<input
						className="w-full rounded-md border px-3 py-2"
						type="password"
						placeholder="영문/숫자 포함 8자 이상"
						value={password}
						onChange={(event) => onChangePassword(event.target.value)}
						autoComplete="new-password"
					/>
				</label>
			</div>

			{errorMessage && (
				<p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
					{errorMessage}
				</p>
			)}

			<div className="mt-6 flex justify-end">
				<button
					type="button"
					onClick={handleNext}
					disabled={isNextDisabled}
					className="rounded-lg bg-primary px-5 py-2 font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
				>
					{signupMutation.isPending ? "가입 중..." : "다음"}
				</button>
			</div>
		</section>
	);
}
