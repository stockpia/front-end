import { api } from "@/lib/api/axios";
import type {
	AccountSigninPayload,
	AccountSigninResponse,
	AccountSignupPayload,
	AccountSignupResponse,
	KisAccountConnectPayload,
	KisAccountConnectResponse,
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

// KIS 계좌 연동: 회원가입 후 user_id 로 호출
export async function connectKisAccount(payload: KisAccountConnectPayload) {
	const { data } = await api.post<KisAccountConnectResponse>(
		"/web/kis/connect",
		payload,
	);
	return data;
}
