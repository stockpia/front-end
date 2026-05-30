import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { Eye, EyeOff, FlaskConical, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signinAccount } from "@/lib/api/accounts";
import { setAccountSession } from "@/lib/auth/session";

const DEMO_ACCOUNT_LOGIN_ID = "test";
const DEMO_ACCOUNT_PASSWORD = "Test1234!";

function toErrorMessage(error: unknown) {
	if (
		isAxiosError<{
			error?: string;
			message?: string;
		}>(error)
	) {
		return (
			error.response?.data?.error ??
			error.response?.data?.message ??
			error.message
		);
	}

	return error instanceof Error
		? error.message
		: "로그인 중 오류가 발생했습니다.";
}

export default function SigninStep() {
	const navigate = useNavigate();
	const [loginId, setLoginId] = useState("");
	const [password, setPassword] = useState("");
	const [isPasswordVisible, setIsPasswordVisible] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [testLoginMessage, setTestLoginMessage] = useState<string | null>(null);

	const signinMutation = useMutation({
		mutationFn: signinAccount,
		onSuccess: (response) => {
			setErrorMessage(null);
			setAccountSession({
				userId: response.user_id,
				loginId: response.login_id,
				name: response.name,
				accountNumber: response.account_number ?? "미연동",
			});
			navigate("/stocks");
		},
		onError: (error) => {
			setErrorMessage(toErrorMessage(error));
		},
	});

	const testAccountMutation = useMutation({
		mutationFn: signinAccount,
		onSuccess: (response) => {
			setErrorMessage(null);
			setTestLoginMessage(response.message);
			setAccountSession({
				userId: response.user_id,
				loginId: response.login_id,
				name: response.name,
				accountNumber: response.account_number ?? "미연동",
			});
			navigate("/stocks");
		},
		onError: (error) => {
			setTestLoginMessage(null);
			setErrorMessage(toErrorMessage(error));
		},
	});

	const isSubmitDisabled =
		!loginId.trim() || !password.trim() || signinMutation.isPending;
	const isTestLoginPending = testAccountMutation.isPending;

	return (
		<section className="w-full rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_12px_40px_-32px_rgba(15,23,42,0.6)] sm:p-6">
			<h2 className="text-xl font-semibold">기존 사용자 로그인</h2>
			<div className="mt-5 space-y-8 text-left">
				<label className="block">
					<span className="mb-1 block text-sm">아이디</span>
					<input
						className="w-full rounded-md border px-3 py-2"
						type="text"
						placeholder="아이디"
						autoComplete="username"
						value={loginId}
						onChange={(event) => setLoginId(event.target.value)}
					/>
				</label>
				<label className="block">
					<span className="mb-1 block text-sm">비밀번호</span>
					<div className="flex w-full items-center rounded-md border px-3 py-2 focus-within:border-slate-400">
						<input
							className="min-w-0 flex-1 border-none p-0 outline-none"
							type={isPasswordVisible ? "text" : "password"}
							placeholder="비밀번호를 입력하세요"
							value={password}
							onChange={(event) => setPassword(event.target.value)}
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
							login_id: loginId.trim(),
							password: password.trim(),
						});
					}}
					disabled={isSubmitDisabled}
					className="rounded-lg bg-primary px-5 py-2 font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
				>
					{signinMutation.isPending ? "로그인 중..." : "로그인"}
				</button>
			</div>

			<div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-4 text-left sm:p-5">
				<div className="flex items-start gap-3">
					<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white">
						<FlaskConical className="h-5 w-5" />
					</div>
					<div className="min-w-0 flex-1">
						<div className="flex flex-wrap items-center gap-2">
							<h3 className="text-base font-semibold text-slate-900">
								데모 계정으로 경험해보기
							</h3>
							<span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700">
								<ShieldCheck className="h-3 w-3" />
								Demo
							</span>
						</div>
						<p className="mt-2 text-sm leading-6 text-slate-500">
							별도의 계좌 연동 없이 데모 계정으로 M.A.T.E의 종목 조회, 리포트,
							주문 흐름을 먼저 경험할 수 있습니다.
						</p>
					</div>
				</div>

				{testLoginMessage && (
					<p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
						{testLoginMessage}
					</p>
				)}

				<button
					type="button"
					onClick={() => {
						testAccountMutation.mutate({
							login_id: DEMO_ACCOUNT_LOGIN_ID,
							password: DEMO_ACCOUNT_PASSWORD,
						});
					}}
					disabled={isTestLoginPending}
					className="mt-4 w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
				>
					{isTestLoginPending ? "데모 계정 준비 중..." : "데모로 시작하기"}
				</button>
			</div>
		</section>
	);
}
