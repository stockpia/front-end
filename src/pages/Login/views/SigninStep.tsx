import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signinAccount } from "@/lib/api/accounts";
import { setAccountSession } from "@/lib/auth/session";

function toErrorMessage(error: unknown) {
	if (isAxiosError<{ error?: string }>(error)) {
		return error.response?.data?.error ?? error.message;
	}

	return error instanceof Error
		? error.message
		: "로그인 중 오류가 발생했습니다.";
}

export default function SigninStep() {
	const navigate = useNavigate();
	const [phone, setPhone] = useState("");
	const [password, setPassword] = useState("");
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const signinMutation = useMutation({
		mutationFn: signinAccount,
		onSuccess: (response, variables) => {
			setErrorMessage(null);
			setAccountSession({
				userId: response.user_id,
				name: response.name,
				phone: variables.phone,
			});
			navigate("/stocks");
		},
		onError: (error) => {
			setErrorMessage(toErrorMessage(error));
		},
	});

	const isSubmitDisabled =
		!phone.trim() || !password.trim() || signinMutation.isPending;

	return (
		<section className="w-full rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_40px_-32px_rgba(15,23,42,0.6)]">
			<h2 className="text-xl font-semibold">기존 사용자 로그인</h2>
			<div className="mt-5 space-y-8 text-left">
				<label className="block">
					<span className="mb-1 block text-sm">전화번호</span>
					<input
						className="w-full rounded-md border px-3 py-2"
						type="tel"
						placeholder="010-1234-5678"
						value={phone}
						onChange={(event) => setPhone(event.target.value)}
						autoComplete="username"
					/>
				</label>
				<label className="block">
					<span className="mb-1 block text-sm">비밀번호</span>
					<input
						className="w-full rounded-md border px-3 py-2"
						type="password"
						placeholder="비밀번호"
						value={password}
						onChange={(event) => setPassword(event.target.value)}
						autoComplete="current-password"
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
					onClick={() => {
						signinMutation.mutate({
							phone: phone.trim(),
							password,
						});
					}}
					disabled={isSubmitDisabled}
					className="rounded-lg bg-primary px-5 py-2 font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
				>
					{signinMutation.isPending ? "로그인 중..." : "로그인"}
				</button>
			</div>
		</section>
	);
}
