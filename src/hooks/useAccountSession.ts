import { useSyncExternalStore } from "react";
import { getAccountSession, subscribeAccountSession } from "@/lib/auth/session";

export function useAccountSession() {
	return useSyncExternalStore(
		subscribeAccountSession,
		getAccountSession,
		() => null,
	);
}
