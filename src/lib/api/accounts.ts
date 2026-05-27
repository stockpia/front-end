import { api } from "@/lib/api/axios";
import type {
	AccountSigninPayload,
	AccountSigninResponse,
	AccountSignoutPayload,
	AccountSignoutResponse,
	AccountSignupPayload,
	AccountSignupResponse,
	KisConnectPayload,
	KisConnectResponse,
	NotifySettings,
	NotifySettingsPatchPayload,
	TelegramConnectPayload,
	TelegramConnectResponse,
	TelegramStatusResponse,
	TelegramUnlinkPayload,
	TelegramUnlinkResponse,
} from "@/types/accounts";

export async function signupAccount(payload: AccountSignupPayload) {
	const { data } = await api.post<AccountSignupResponse>(
		"/web/users/signup",
		payload,
	);
	return data;
}

export async function signinAccount(payload: AccountSigninPayload) {
	const { data } = await api.post<AccountSigninResponse>(
		"/web/users/signin",
		payload,
	);
	return data;
}

export async function signoutAccount(payload: AccountSignoutPayload) {
	const { data } = await api.post<AccountSignoutResponse>(
		"/web/accounts/signout",
		payload,
	);
	return data;
}

export async function connectKisAccount(payload: KisConnectPayload) {
	const { data } = await api.post<KisConnectResponse>(
		"/web/kis/connect",
		payload,
	);
	return data;
}

// ─── Telegram 연동 (Deep Link 모델) ───
// 사용자는 직접 토큰을 입력하지 않습니다.
// 마이페이지에서 connect → 받은 deep_link 를 클릭 → 봇이 자동으로 chat_id 매핑.

export async function connectTelegram(payload: TelegramConnectPayload) {
	const { data } = await api.post<TelegramConnectResponse>(
		"/web/users/telegram/connect",
		payload,
	);
	return data;
}

export async function getTelegramStatus(userId: string, signal?: AbortSignal) {
	const { data } = await api.get<TelegramStatusResponse>(
		"/web/users/telegram/status",
		{ params: { user_id: userId }, signal },
	);
	return data;
}

export async function unlinkTelegram(payload: TelegramUnlinkPayload) {
	const { data } = await api.delete<TelegramUnlinkResponse>(
		"/web/users/telegram/unlink",
		{ data: payload },
	);
	return data;
}

// ─── 알림 수신 설정 ───

export async function getNotifySettings(userId: string, signal?: AbortSignal) {
	const { data } = await api.get<NotifySettings>(
		"/web/users/notify-settings",
		{ params: { user_id: userId }, signal },
	);
	return data;
}

export async function patchNotifySettings(payload: NotifySettingsPatchPayload) {
	const { data } = await api.patch<NotifySettings>(
		"/web/users/notify-settings",
		payload,
	);
	return data;
}
