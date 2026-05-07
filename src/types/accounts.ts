export type AccountEnvironment = "vps" | "prod";

export type AccountSignupPayload = {
	user_id?: string;
	name: string;
	birthdate: string;
	phone: string;
	account_number: string;
	app_key: string;
	app_secret_key: string;
	env?: AccountEnvironment;
};

export type AccountSignupResponse = {
	message: string;
	name: string;
	account_number: string;
};

export type AccountSigninPayload = {
	name: string;
	phone: string;
};

export type AccountSigninResponse = {
	message: string;
	name: string;
	account_number: string;
	user_id: string;
};

export type AccountSignoutPayload = {
	user_id: string;
};

export type AccountSignoutResponse = {
	message: string;
};

export type AccountSession = {
	userId: string;
	name: string;
	phone: string;
	accountNumber: string;
};
