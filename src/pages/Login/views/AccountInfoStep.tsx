import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { CircleHelp, ExternalLink, KeyRound } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CommonModal from "@/components/CommonModal";
import { signupAccount } from "@/lib/api/accounts";
import { setAccountSession } from "@/lib/auth/session";
import type { AccountEnvironment } from "@/types/accounts";

type AccountInfoStepProps = {
	name: string;
	birthDate: string;
	phoneNumber: string;
	onPrev: () => void;
};

function toErrorMessage(error: unknown) {
	if (
		isAxiosError<{
			error?: string;
			detail?: string;
		}>(error)
	) {
		const { error: message, detail } = error.response?.data ?? {};
		return [message, detail].filter(Boolean).join(" ");
	}

	return error instanceof Error
		? error.message
		: "계좌 연동 중 오류가 발생했습니다.";
}

export default function AccountInfoStep({
	name,
	birthDate,
	phoneNumber,
	onPrev,
}: AccountInfoStepProps) {
	const navigate = useNavigate();
	const [accountNumber, setAccountNumber] = useState("");
	const [appKey, setAppKey] = useState("");
	const [appSecretKey, setAppSecretKey] = useState("");
	const [environment, setEnvironment] = useState<AccountEnvironment>("vps");
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
	const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);

	const signupMutation = useMutation({
		mutationFn: signupAccount,
		onSuccess: (response, variables) => {
			setErrorMessage(null);
			setAccountSession({
				userId: variables.user_id?.trim() || "default_user",
				name: response.name,
				phone: variables.phone,
				accountNumber: response.account_number,
			});
			setIsSuccessModalOpen(true);
		},
		onError: (error) => {
			setErrorMessage(toErrorMessage(error));
		},
	});

	const isSubmitDisabled =
		!name.trim() ||
		!birthDate.trim() ||
		!phoneNumber.trim() ||
		!accountNumber.trim() ||
		!appKey.trim() ||
		!appSecretKey.trim() ||
		signupMutation.isPending;

	const handleMoveToChatbot = () => {
		window.close();
	};

	const handleOpenPortal = () => {
		window.open(
			"https://apiportal.koreainvestment.com/intro",
			"_blank",
			"noopener,noreferrer",
		);
	};

	const handleSubmit = () => {
		signupMutation.mutate({
			name: name.trim(),
			birthdate: birthDate.trim(),
			phone: phoneNumber.trim(),
			account_number: accountNumber.trim(),
			app_key: appKey.trim(),
			app_secret_key: appSecretKey.trim(),
			env: environment,
		});
	};

	return (
		<section className="w-full rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_40px_-32px_rgba(15,23,42,0.6)]">
			<h2 className="text-xl font-semibold">계좌 정보 입력</h2>
			<div className="mt-5 space-y-8 text-left">
				<label className="block">
					<span className="mb-1 block text-sm">한국투자증권 계좌번호</span>
					<input
						className="w-full rounded-md border px-3 py-2"
						type="text"
						placeholder="계좌번호를 입력하세요"
						value={accountNumber}
						onChange={(event) => setAccountNumber(event.target.value)}
					/>
				</label>

				<div className="rounded-2xl border border-sky-100 bg-gradient-to-r from-sky-50 via-white to-emerald-50 p-4">
					<div className="flex items-start gap-3">
						<div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-sky-600 shadow-sm">
							<KeyRound className="h-5 w-5" />
						</div>
						<div className="min-w-0 flex-1">
							<p className="text-sm font-semibold text-slate-900">
								App Key / App Secret 발급이 필요하신가요?
							</p>
							<div className="mt-4 flex flex-col gap-2 sm:flex-row">
								<button
									type="button"
									onClick={handleOpenPortal}
									className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
								>
									발급 받으러 가기
									<ExternalLink className="h-4 w-4" />
								</button>
								<button
									type="button"
									onClick={() => setIsGuideModalOpen(true)}
									className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
								>
									발급 방법 보기
									<CircleHelp className="h-4 w-4" />
								</button>
							</div>
						</div>
					</div>
				</div>

				<label className="block">
					<span className="mb-1 block text-sm">APP key</span>
					<input
						className="w-full rounded-md border px-3 py-2"
						type="text"
						placeholder="APP key를 입력하세요"
						value={appKey}
						onChange={(event) => setAppKey(event.target.value)}
					/>
				</label>
				<label className="block">
					<span className="mb-1 block text-sm">APP secret key</span>
					<input
						className="w-full rounded-md border px-3 py-2"
						type="password"
						placeholder="APP secret key를 입력하세요"
						value={appSecretKey}
						onChange={(event) => setAppSecretKey(event.target.value)}
					/>
				</label>

				<label className="block">
					<span className="mb-1 block text-sm">투자 환경</span>
					<select
						className="w-full rounded-md border px-3 py-2"
						value={environment}
						onChange={(event) =>
							setEnvironment(event.target.value as AccountEnvironment)
						}
					>
						<option value="vps">모의투자 (vps)</option>
						<option value="prod">실전투자 (prod)</option>
					</select>
				</label>
			</div>

			{errorMessage && (
				<p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
					{errorMessage}
				</p>
			)}

			<div className="mt-6 flex justify-between">
				<button
					type="button"
					onClick={onPrev}
					className="rounded-lg border px-5 py-2 font-medium"
				>
					이전
				</button>
				<button
					type="button"
					onClick={handleSubmit}
					disabled={isSubmitDisabled}
					className="rounded-lg bg-primary px-5 py-2 font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
				>
					{signupMutation.isPending ? "연동 중..." : "연동 완료"}
				</button>
			</div>

			<CommonModal
				open={isSuccessModalOpen}
				onClose={() => setIsSuccessModalOpen(false)}
				title="계좌 연결이 완료됐어요 !"
				description={
					"이제 주토피아에서\n해당 계좌를 기반으로\n다양한 리포트와 서비스를\n사용할 수 있어요 😁"
				}
				actionLabel="메인 화면으로"
				onAction={() => navigate("/")}
				secondaryActionLabel="챗봇으로"
				onSecondaryAction={handleMoveToChatbot}
			/>

			<CommonModal
				open={isGuideModalOpen}
				onClose={() => setIsGuideModalOpen(false)}
				title="App Key 발급 방법"
				description="한국투자증권 API 포털에서 아래 순서대로 진행해 주세요."
				actionLabel="포털로 이동"
				onAction={handleOpenPortal}
				secondaryActionLabel="닫기"
				onSecondaryAction={() => setIsGuideModalOpen(false)}
				icon={<KeyRound className="h-6 w-6 text-sky-600" />}
				note="완료 화면에서 발급된 App Key와 App Secret을 복사해 이 화면에 입력하면 됩니다."
				className="max-w-lg text-left"
			>
				<div className="relative mt-6 space-y-3 text-left">
					{[
						"우측 상단에서 [로그인] 클릭 (한국투자증권 APP으로 QR 인증 시 편리해요!)",
						"[API 서비스 신청] 선택",
						"휴대폰 인증 등 안내 절차 진행",
						"완료 화면에서 App Key, App Secret 복사 후 작성",
					].map((step, index) => (
						<div
							key={step}
							className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
						>
							<div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
								{index + 1}
							</div>
							<p className="pt-0.5 text-sm leading-6 text-slate-700">{step}</p>
						</div>
					))}
				</div>
			</CommonModal>
		</section>
	);
}
