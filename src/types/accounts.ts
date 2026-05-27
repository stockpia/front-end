export type AccountEnvironment = "vps" | "prod";

export type AccountSignupPayload = {
	name: string;
	birthdate: string;
	phone: string;
	password: string;
};

export type AccountSignupResponse = {
	message: string;
	user_id: string;
};

export type AccountSigninPayload = {
	phone: string;
	password: string;
};

export type AccountSigninResponse = {
	message: string;
	name: string;
	user_id: string;
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
};

export type KisConnectResponse = {
	message: string;
};

export type AccountSession = {
	userId: string;
	name: string;
	phone: string;
	accountNumber: string;
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
