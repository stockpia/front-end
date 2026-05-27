import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import {
	BarChart3,
	BellRing,
	ChartNoAxesCombined,
	CheckCircle2,
	ChevronRight,
	ExternalLink,
	MessageCircle,
	Scale,
	ShieldCheck,
	TrendingUp,
	UserRound,
	Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import CommonModal from "@/components/CommonModal";
import { useAccountSession } from "@/hooks/useAccountSession";
import {
	connectTelegram,
	getNotifySettings,
	getTelegramStatus,
	patchNotifySettings,
	unlinkTelegram,
} from "@/lib/api/accounts";
import {
	getInvestmentProfile,
	subscribeInvestmentProfile,
	type InvestmentProfile,
} from "@/lib/investmentProfile";
import type {
	NotifySettings,
	TelegramConnectResponse,
	TelegramStatusResponse,
} from "@/types/accounts";

type AccountMode = "mock" | "real";

type BriefingKey = keyof NotifySettings;

const briefingOptions: {
	key: BriefingKey;
	label: string;
	description: string;
}[] = [
	{
		key: "notify_morning",
		label: "장 시작 브리핑 (08:30)",
		description: "개장 전 시장 동향·보유 종목 변동성 요약을 받습니다.",
	},
	{
		key: "notify_evening",
		label: "장 마감 브리핑 (16:00)",
		description: "오늘의 매매 결산과 지정 종목 리포트를 받습니다.",
	},
	{
		key: "notify_event",
		label: "장중 이벤트 푸시",
		description: "평단 ±5% 같은 긴급 사건이 발생하면 즉시 알려드립니다.",
	},
];

function toErrorMessage(error: unknown) {
	if (isAxiosError<{ error?: string }>(error)) {
		return error.response?.data?.error ?? error.message;
	}
	return error instanceof Error ? error.message : "처리 중 오류가 발생했습니다.";
}

export default function MyPage() {
	const accountSession = useAccountSession();
	const userId = accountSession?.userId ?? null;
	const queryClient = useQueryClient();

	const [name, setName] = useState(accountSession?.name ?? "");
	const [phone, setPhone] = useState(accountSession?.phone ?? "");
	const [email, setEmail] = useState("mate@example.com");
	const [accountMode, setAccountMode] = useState<AccountMode>("mock");
	const [investmentProfile, setInvestmentProfile] =
		useState<InvestmentProfile | null>(() => getInvestmentProfile());
	const [deepLink, setDeepLink] = useState<TelegramConnectResponse | null>(null);
	const [isUnlinkConfirmOpen, setIsUnlinkConfirmOpen] = useState(false);

	const accountNumber = accountSession?.accountNumber ?? "연동된 계좌 없음";
	const accountModeLabel = accountMode === "mock" ? "모의" : "실전";

	useEffect(() => {
		return subscribeInvestmentProfile(() => {
			setInvestmentProfile(getInvestmentProfile());
		});
	}, []);

	// ── 알림 수신 설정 (서버 동기화) ──────────────────────
	const notifyQuery = useQuery({
		queryKey: ["notify-settings", userId],
		queryFn: ({ signal }) => getNotifySettings(userId as string, signal),
		enabled: Boolean(userId),
	});

	const briefingSettings: NotifySettings = notifyQuery.data ?? {
		notify_morning: true,
		notify_evening: true,
		notify_event: true,
	};

	const notifyPatchMutation = useMutation({
		mutationFn: patchNotifySettings,
		onSuccess: (data) => {
			queryClient.setQueryData(["notify-settings", userId], data);
		},
	});

	const handleBriefingChange = (key: BriefingKey, checked: boolean) => {
		if (!userId) return;
		// 즉시 UI 반영 (optimistic)
		queryClient.setQueryData<NotifySettings>(
			["notify-settings", userId],
			(prev) => ({ ...(prev ?? briefingSettings), [key]: checked }),
		);
		notifyPatchMutation.mutate({ user_id: userId, [key]: checked });
	};

	// ── Telegram 연결 상태 ─────────────────────────────
	const telegramStatusQuery = useQuery({
		queryKey: ["telegram-status", userId],
		queryFn: ({ signal }) => getTelegramStatus(userId as string, signal),
		enabled: Boolean(userId),
	});

	const telegramStatus: TelegramStatusResponse = telegramStatusQuery.data ?? {
		linked: false,
	};

	const connectMutation = useMutation({
		mutationFn: connectTelegram,
		onSuccess: (data) => setDeepLink(data),
	});

	const unlinkMutation = useMutation({
		mutationFn: unlinkTelegram,
		onSuccess: () => {
			queryClient.setQueryData<TelegramStatusResponse>(
				["telegram-status", userId],
				{ linked: false },
			);
			setIsUnlinkConfirmOpen(false);
		},
	});

	const handleStartConnect = () => {
		if (!userId) return;
		connectMutation.mutate({ user_id: userId });
	};

	const handleConfirmUnlink = () => {
		if (!userId) return;
		unlinkMutation.mutate({ user_id: userId });
	};

	const handleDeepLinkClose = () => {
		setDeepLink(null);
		// 봇 연결 후엔 사용자가 텔레그램에서 START 누르면 매핑됨 → 잠시 후 상태 재조회
		queryClient.invalidateQueries({ queryKey: ["telegram-status", userId] });
	};

	const deepLinkExpiresLabel = useMemo(() => {
		if (!deepLink) return null;
		const date = new Date(deepLink.expires_at);
		return date.toLocaleTimeString("ko-KR", {
			hour: "2-digit",
			minute: "2-digit",
		});
	}, [deepLink]);

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
					icon={<ChartNoAxesCombined className="h-5 w-5" />}
					title="내 투자 성향"
				/>
				<div className="mt-5">
					<InvestmentProfilePanel profile={investmentProfile} />
				</div>
			</section>

			<section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_40px_-32px_rgba(15,23,42,0.6)]">
				<SectionTitle
					icon={<BellRing className="h-5 w-5" />}
					title="알림 설정"
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
				{notifyPatchMutation.isError && (
					<p className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs text-rose-700">
						알림 설정 저장에 실패했어요. 잠시 후 다시 시도해주세요.
					</p>
				)}

				{/* ── Telegram 섹션 (Deep Link 모델) ── */}
				<div className="mt-6 border-t border-slate-100 pt-6">
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
							<MessageCircle className="h-5 w-5" />
						</div>
						<h3 className="text-lg font-semibold text-slate-900">
							Telegram 연결
						</h3>
					</div>

					{telegramStatusQuery.isLoading ? (
						<p className="mt-4 text-sm text-slate-500">상태 확인 중...</p>
					) : telegramStatus.linked ? (
						<TelegramLinkedPanel
							username={telegramStatus.telegram_username}
							linkedAt={telegramStatus.linked_at}
							onUnlink={() => setIsUnlinkConfirmOpen(true)}
						/>
					) : (
						<TelegramConnectPanel
							onStart={handleStartConnect}
							isPending={connectMutation.isPending}
							errorMessage={
								connectMutation.isError
									? toErrorMessage(connectMutation.error)
									: null
							}
						/>
					)}
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

			{/* ── Deep Link 모달 ── */}
			<CommonModal
				open={Boolean(deepLink)}
				onClose={handleDeepLinkClose}
				title="텔레그램에서 연결을 완료하세요"
				description={
					deepLink
						? `아래 버튼을 누르면 텔레그램이 열려요.\n채팅창에서 [START] 버튼을 누르면 자동으로 연결됩니다.\n\n링크 유효 시간: ${deepLinkExpiresLabel} 까지 (약 10분)`
						: ""
				}
				icon={<MessageCircle className="h-6 w-6 text-sky-600" />}
				actionLabel="텔레그램으로 이동"
				onAction={() => {
					if (!deepLink) return;
					window.open(deepLink.deep_link, "_blank", "noopener,noreferrer");
				}}
				secondaryActionLabel="닫기"
				onSecondaryAction={handleDeepLinkClose}
			>
				{deepLink && (
					<div className="mt-4 break-all rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
						{deepLink.deep_link}
					</div>
				)}
			</CommonModal>

			<CommonModal
				open={isUnlinkConfirmOpen}
				onClose={() => setIsUnlinkConfirmOpen(false)}
				title="Telegram 연결을 해제할까요?"
				description={
					"연결을 해제하면 더 이상 브리핑·이벤트 알림을 받지 못해요.\n다시 연결하려면 마이페이지에서 한 번 더 진행하시면 됩니다."
				}
				actionLabel={unlinkMutation.isPending ? "해제 중..." : "연결 해제"}
				onAction={handleConfirmUnlink}
				secondaryActionLabel="취소"
				onSecondaryAction={() => setIsUnlinkConfirmOpen(false)}
			/>
		</div>
	);
}

type TelegramConnectPanelProps = {
	onStart: () => void;
	isPending: boolean;
	errorMessage: string | null;
};

function TelegramConnectPanel({
	onStart,
	isPending,
	errorMessage,
}: TelegramConnectPanelProps) {
	return (
		<div className="mt-5">
			<div className="rounded-2xl border border-sky-100 bg-gradient-to-r from-sky-50 via-white to-emerald-50 p-4">
				<p className="text-sm font-semibold text-slate-900">
					아직 텔레그램에 연결되지 않았어요.
				</p>
				<p className="mt-1 text-xs leading-5 text-slate-500">
					버튼을 누르면 연결용 일회용 링크를 받아요. 텔레그램에서 [START] 한
					번이면 자동 연결됩니다. (별도 토큰/Chat ID 입력 불필요)
				</p>
				<button
					type="button"
					onClick={onStart}
					disabled={isPending}
					className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
				>
					{isPending ? "링크 발급 중..." : "텔레그램으로 연결하기"}
					<ExternalLink className="h-4 w-4" />
				</button>
			</div>
			{errorMessage && (
				<p className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
					{errorMessage}
				</p>
			)}
		</div>
	);
}

type TelegramLinkedPanelProps = {
	username: string | null;
	linkedAt: string;
	onUnlink: () => void;
};

function TelegramLinkedPanel({
	username,
	linkedAt,
	onUnlink,
}: TelegramLinkedPanelProps) {
	const linkedAtLabel = useMemo(() => {
		const date = new Date(linkedAt);
		return date.toLocaleString("ko-KR", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
		});
	}, [linkedAt]);

	return (
		<div className="mt-5">
			<div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
				<div className="flex items-start gap-3">
					<CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
					<div className="min-w-0 flex-1">
						<p className="text-sm font-semibold text-emerald-900">
							{username ? `@${username} 와 연결됨` : "연결 완료"}
						</p>
						<p className="mt-1 text-xs text-emerald-800/80">
							연결 시각: {linkedAtLabel}
						</p>
					</div>
				</div>
			</div>
			<button
				type="button"
				onClick={onUnlink}
				className="mt-3 inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
			>
				연결 해제
			</button>
		</div>
	);
}

type InvestmentProfilePanelProps = {
	profile: InvestmentProfile | null;
};

function InvestmentProfilePanel({ profile }: InvestmentProfilePanelProps) {
	return (
		<div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
			<div className="flex items-start gap-3">
				<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
					<ChartNoAxesCombined className="h-5 w-5" />
				</div>
				<div className="min-w-0 flex-1">
					<h3 className="mt-1 text-lg font-semibold text-slate-900">
						{profile ? (
							<InvestmentProfileResultLabel
								level={profile.result.level}
								name={`${profile.result.name} · ${profile.result.score}점`}
							/>
						) : (
							"아직 설정되지 않았습니다"
						)}
					</h3>
					<p className="mt-1 text-xs leading-5 text-slate-500">
						{profile
							? profile.result.feature
							: "5개 문항으로 위험 감내도와 투자 행동 양식을 점수화합니다."}
					</p>
				</div>
			</div>
			<Link
				to="/mypage/investment-profile"
				className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
			>
				{profile ? "재설정하러 가기" : "성향 설정하기"}
				<ChevronRight className="h-4 w-4" />
			</Link>
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
			<span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-white">
				<Icon className="h-4 w-4" />
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
