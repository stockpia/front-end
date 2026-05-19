import type { AccountSession } from "@/types/accounts";

const ACCOUNT_SESSION_KEY = "stockpia.account.session";
const ACCOUNT_SESSION_EVENT = "stockpia:account-session-change";

function isBrowser() {
	return typeof window !== "undefined";
}

export function getAccountSession(): AccountSession | null {
	if (!isBrowser()) {
		return null;
	}

	const raw = window.localStorage.getItem(ACCOUNT_SESSION_KEY);
	if (!raw) {
		return null;
	}

	try {
		return JSON.parse(raw) as AccountSession;
	} catch {
		window.localStorage.removeItem(ACCOUNT_SESSION_KEY);
		return null;
	}
}

function notifyAccountSessionChange() {
	if (!isBrowser()) {
		return;
	}

	window.dispatchEvent(new Event(ACCOUNT_SESSION_EVENT));
}

export function setAccountSession(session: AccountSession) {
	if (!isBrowser()) {
		return;
	}

	window.localStorage.setItem(ACCOUNT_SESSION_KEY, JSON.stringify(session));
	notifyAccountSessionChange();
}

export function clearAccountSession() {
	if (!isBrowser()) {
		return;
	}

	window.localStorage.removeItem(ACCOUNT_SESSION_KEY);
	notifyAccountSessionChange();
}

export function subscribeAccountSession(onChange: () => void) {
	if (!isBrowser()) {
		return () => undefined;
	}

	const handleStorage = (event: StorageEvent) => {
		if (event.key === ACCOUNT_SESSION_KEY) {
			onChange();
		}
	};

	window.addEventListener("storage", handleStorage);
	window.addEventListener(ACCOUNT_SESSION_EVENT, onChange);

	return () => {
		window.removeEventListener("storage", handleStorage);
		window.removeEventListener(ACCOUNT_SESSION_EVENT, onChange);
	};
}
