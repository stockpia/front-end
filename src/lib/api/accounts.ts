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

// TODO: 백엔드에 signout endpoint 미구현. 합의될 때까지 클라이언트단에서 로컬 세션만 정리.
// 호출 시 404 가 떨어져도 mutation onError 에서 무시하도록 처리하거나,
// 백엔드 추가 후 경로 확정 시 활성화하세요.
export async function signoutAccount(payload: AccountSignoutPayload) {
  const { data } = await api.post<AccountSignoutResponse>(
    "/web/users/signout",
    payload,
  );
  return data;
}
