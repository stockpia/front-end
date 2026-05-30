export type AccountEnvironment = "vps" | "prod";

export type AccountSignupPayload = {
	login_id: string;
	name: string;
	birthdate: string;
	password: string;
	phone?: string;  // 부가 정보 (unique 아님, 선택)
};

export type AccountSignupResponse = {
	message: string;
	user_id: string;
	login_id: string;
};

export type AccountSigninPayload = {
	login_id: string;
	password: string;
};

export type AccountSigninResponse = {
	message: string;
	name: string;
	user_id: string;
	login_id: string;
	account_number?: string;
};

export type AccountSignoutPayload = {
	user_id: string;
};

export type AccountSignoutResponse = {
	message: string;
};

export type KisConnectPayload = {
	user_id: string;
	app_key?: string;
	app_secret?: string;
	account_number?: string;
	env?: AccountEnvironment;
};

export type KisConnectResponse = {
	message: string;
	kis_connected?: boolean;
	kis_account_number?: string | null;
	kis_env?: string | null;
	source?: "user" | "system_env";
};

export type KisDisconnectPayload = {
	user_id: string;
};

export type KisDisconnectResponse = {
	message: string;
	kis_connected: boolean;
};

export type AccountSession = {
	userId: string;
	loginId?: string;  // 신규 — 구버전 세션엔 없을 수 있어 optional
	name: string;
	phone?: string;
	accountNumber: string;
};

export type UserDetailResponse = {
	user_id: string;
	login_id: string;
	phone: string | null;
	name: string;
	birthdate: string;
	notify_morning: boolean;
	notify_evening: boolean;
	notify_event: boolean;
	kis_connected: boolean;
	kis_account_number: string | null;
	kis_env: string | null;
	telegram_connected: boolean;
	telegram_username: string | null;
	created_at: string;
	updated_at: string;
};

// ─── Telegram 연동 (Deep Link 모델) ───
export type TelegramConnectPayload = { user_id: string };

export type TelegramConnectResponse = {
	deep_link: string;
	token: string;
	expires_at: string;
};

export type TelegramStatusResponse =
	| { linked: false }
	| {
			linked: true;
			telegram_username: string | null;
			linked_at: string;
	  };

export type TelegramUnlinkPayload = { user_id: string };
export type TelegramUnlinkResponse = { unlinked: boolean };

// ─── 알림 수신 설정 ───
export type NotifySettings = {
	notify_morning: boolean;
	notify_evening: boolean;
	notify_event: boolean;
};

export type NotifySettingsPatchPayload = Partial<NotifySettings> & {
	user_id: string;
};
