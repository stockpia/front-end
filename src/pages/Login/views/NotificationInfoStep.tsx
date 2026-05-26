import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { MessageCircle } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CommonModal from "@/components/CommonModal";
import { signupAccount } from "@/lib/api/accounts";
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
	name: string;
	birthDate: string;
	phoneNumber: string;
	password: string;
	accountNumber: string;
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
	name,
	birthDate,
	phoneNumber,
	password,
	accountNumber,
	onPrev,
}: NotificationInfoStepProps) {
	const navigate = useNavigate();
	const [telegramChatId, setTelegramChatId] = useState("");
	const [botToken, setBotToken] = useState("");
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
		onSuccess: (response, variables) => {
			setErrorMessage(null);
			setAccountSession({
				userId: response.user_id,
				name: variables.name,
				phone: variables.phone,
				accountNumber: accountNumber.trim() || "연동된 계좌 없음",
			});
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

	const handleMoveToChatbot = () => {
		window.close();
	};

	const handleSubmit = () => {
		signupMutation.mutate({
			name: name.trim(),
			birthdate: birthDate.trim(),
			phone: phoneNumber.trim(),
			password: password.trim(),
		});
	};

	return (
		<section className="w-full rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_40px_-32px_rgba(15,23,42,0.6)]">
			<div className="flex items-center gap-3">
				<div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
					<MessageCircle className="h-5 w-5" />
				</div>
				<h2 className="text-xl font-semibold">Telegram 및 알림 설정</h2>
			</div>

			<div className="mt-6 space-y-6 text-left">
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

				<div>
					<p className="text-sm font-semibold text-slate-700">알림 설정</p>
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
				title="계좌 연결이 완료됐어요"
				description={
					"이제 주토피아에서\n해당 계좌를 기반으로\n다양한 리포트와 서비스를\n사용할 수 있어요."
				}
				actionLabel="메인 화면으로"
				onAction={() => navigate("/stocks")}
				secondaryActionLabel="챗봇으로"
				onSecondaryAction={handleMoveToChatbot}
			/>
		</section>
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
			className={`flex cursor-pointer items-start justify-between gap-4 rounded-2xl border px-4 py-3 transition ${
				checked
					? "border-slate-900 bg-slate-50"
					: "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
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
