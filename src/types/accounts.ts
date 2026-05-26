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
