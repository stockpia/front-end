export type AccountEnvironment = "vps" | "prod";

// ─── 회원가입 (비밀번호 기반) ───
export type AccountSignupPayload = {
	phone: string;
	name: string;
	birthdate: string;
	password: string;
};

export type AccountSignupResponse = {
	message: string;
	user_id: string;
};

// ─── 로그인 ───
export type AccountSigninPayload = {
	phone: string;
	password: string;
};

export type AccountSigninResponse = {
	message: string;
	user_id: string;
	name: string;
};

// ─── KIS 계좌 연동 (가입 후 별도 단계) ───
export type KisAccountConnectPayload = {
	user_id: string;
	account_number: string;
	app_key: string;
	app_secret_key: string;
	env?: AccountEnvironment;
};

export type KisAccountConnectResponse = {
	message: string;
	account_number?: string;
};

// ─── 클라이언트 세션 ───
// accountNumber 는 KIS 연동 완료 후에만 채워짐.
export type AccountSession = {
	userId: string;
	name: string;
	phone: string;
	accountNumber?: string;
};
