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
