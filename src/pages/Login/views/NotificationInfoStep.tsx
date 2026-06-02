import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { Info, MessageCircle } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CommonModal from "@/components/CommonModal";
import { patchNotifySettings, signupAccount } from "@/lib/api/accounts";
import { setAccountSession } from "@/lib/auth/session";

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

type NotificationInfoStepProps = {
	loginId: string;
	name: string;
	birthDate: string;
	phoneNumber: string;
	password: string;
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
		: "회원가입 처리 중 오류가 발생했습니다.";
}

export default function NotificationInfoStep({
	loginId,
	name,
	birthDate,
	phoneNumber,
	password,
	onPrev,
}: NotificationInfoStepProps) {
	const navigate = useNavigate();
	const [briefingSettings, setBriefingSettings] = useState<
		Record<BriefingSetting, boolean>
	>({
		marketBriefing: true,
		weekly: false,
	});
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

	const signupMutation = useMutation({
		mutationFn: signupAccount,
		onSuccess: async (response, variables) => {
			setErrorMessage(null);
			setAccountSession({
				userId: response.user_id,
				loginId: response.login_id,
				name: variables.name,
				phone: variables.phone || "",
				accountNumber: "미연동", // KIS 연동은 마이페이지에서 별도
			});

			// 사용자가 토글한 알림 설정을 가입 직후 한 번에 반영
			try {
				await patchNotifySettings({
					user_id: response.user_id,
					notify_morning: briefingSettings.marketBriefing,
					notify_evening: briefingSettings.marketBriefing,
					// 주간 브리핑은 아직 별도 백엔드 필드 없으므로 notify_event 와 매핑하지 않음.
					// 추후 backend 에 notify_weekly 추가되면 여기에 연동.
				});
			} catch {
				// 알림 설정 실패는 회원가입 성공 자체를 막지 않음.
				// 사용자는 마이페이지에서 다시 토글 가능.
			}

			setIsSuccessModalOpen(true);
		},
		onError: (error) => {
			setErrorMessage(toErrorMessage(error));
		},
	});

	const handleBriefingChange = (key: BriefingSetting, checked: boolean) => {
		setBriefingSettings((prev) => ({
			...prev,
			[key]: checked,
		}));
	};

	const handleSubmit = () => {
		const trimmedPhone = phoneNumber.trim();
		// 백엔드 User.birthdate 는 varchar(8) — YYYYMMDD 형식. UI 의 "1990-01-01"
		// 그대로 보내면 PostgreSQL 이 길이 초과로 500. 하이픈 제거 후 전송.
		const birthdateDigits = birthDate.replace(/\D/g, "");
		signupMutation.mutate({
			login_id: loginId.trim(),
			name: name.trim(),
			birthdate: birthdateDigits,
			password: password.trim(),
			...(trimmedPhone ? { phone: trimmedPhone } : {}),
		});
	};

	return (
		<section className="w-full rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_12px_40px_-32px_rgba(15,23,42,0.6)] sm:p-6">
			<div className="flex items-center gap-3">
				<div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
					<MessageCircle className="h-5 w-5" />
				</div>
				<h2 className="text-xl font-semibold">Telegram 알림 설정</h2>
			</div>

			<div className="mt-6 space-y-6 text-left">
				{/* Deep Link 모델 안내 — 사용자는 토큰을 입력하지 않음 */}
				<div className="flex items-start gap-3 rounded-2xl border border-sky-100 bg-sky-50 px-3 py-3 sm:px-4">
					<Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
					<div className="min-w-0 text-sm leading-6 text-sky-900">
						<p className="font-semibold">
							Telegram 봇 연결은 회원가입 후 마이페이지에서 진행해요.
						</p>
						<p className="mt-1 text-sky-800/90">
							버튼 한 번이면 자동 연결됩니다. 별도로 Bot Token 이나 Chat ID 를
							입력하지 않아도 돼요.
						</p>
					</div>
				</div>

				<div>
					<p className="text-sm font-semibold text-slate-700">알림 설정</p>
					<p className="mt-1 text-xs text-slate-500">
						가입 직후 적용되며, 마이페이지에서 언제든 변경할 수 있어요.
					</p>
					<div className="mt-3 grid gap-3">
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
				</div>
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
					disabled={signupMutation.isPending}
					className="rounded-lg bg-primary px-5 py-2 font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
				>
					{signupMutation.isPending ? "가입 중..." : "회원가입 완료"}
				</button>
			</div>

			<CommonModal
				open={isSuccessModalOpen}
				onClose={() => setIsSuccessModalOpen(false)}
				title="회원가입이 완료됐어요"
				description={
					"이제 마이페이지에서 한국투자증권 계좌와\nTelegram 봇을 연결하실 수 있어요.\n\nTelegram 연결은 버튼 한 번이면 됩니다."
				}
				actionLabel="마이페이지로"
				onAction={() => navigate("/mypage")}
				secondaryActionLabel="메인으로"
				onSecondaryAction={() => navigate("/stocks")}
			/>
		</section>
	);
}

type SquareCheckBoxProps = {
	checked: boolean;
	label: string;
	description: string;
	onChange: (checked: boolean) => void;
	disabled?: boolean;
};

function SquareCheckBox({
	checked,
	label,
	description,
	onChange,
	disabled = false,
}: SquareCheckBoxProps) {
	return (
		<label
			className={`flex items-start justify-between gap-3 rounded-2xl border px-3 py-3 transition sm:gap-4 sm:px-4 ${
				disabled
					? "cursor-not-allowed border-slate-200 bg-slate-50 opacity-50"
					: checked
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
					disabled={disabled}
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
