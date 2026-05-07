import { api } from "@/lib/api/axios";
import type {
  AccountSigninPayload,
  AccountSigninResponse,
  AccountSignoutPayload,
  AccountSignoutResponse,
  AccountSignupPayload,
  AccountSignupResponse,
} from "@/types/accounts";

export async function signupAccount(payload: AccountSignupPayload) {
  const { data } = await api.post<AccountSignupResponse>(
    "/web/accounts/signup",
    payload,
  );
  return data;
}

export async function signinAccount(payload: AccountSigninPayload) {
  const { data } = await api.post<AccountSigninResponse>(
    "/web/accounts/signin",
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
