import type { AccountSession } from "@/types/accounts";

const ACCOUNT_SESSION_KEY = "stockpia.account.session";
const ACCOUNT_SESSION_EVENT = "stockpia:account-session-change";
let cachedAccountSessionRaw: string | null = null;
let cachedAccountSession: AccountSession | null = null;

function isBrowser() {
	return typeof window !== "undefined";
}

export function getAccountSession(): AccountSession | null {
	if (!isBrowser()) {
		return null;
	}

	const raw = window.localStorage.getItem(ACCOUNT_SESSION_KEY);
	if (!raw) {
		cachedAccountSessionRaw = null;
		cachedAccountSession = null;
		return null;
	}

	if (raw === cachedAccountSessionRaw) {
		return cachedAccountSession;
	}

	try {
		cachedAccountSessionRaw = raw;
		cachedAccountSession = JSON.parse(raw) as AccountSession;
		return cachedAccountSession;
	} catch {
		window.localStorage.removeItem(ACCOUNT_SESSION_KEY);
		cachedAccountSessionRaw = null;
		cachedAccountSession = null;
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

	const raw = JSON.stringify(session);
	cachedAccountSessionRaw = raw;
	cachedAccountSession = session;
	window.localStorage.setItem(ACCOUNT_SESSION_KEY, raw);
	notifyAccountSessionChange();
}

export function clearAccountSession() {
	if (!isBrowser()) {
		return;
	}

	cachedAccountSessionRaw = null;
	cachedAccountSession = null;
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
