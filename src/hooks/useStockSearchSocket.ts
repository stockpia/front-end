import { useEffect, useMemo, useRef, useState } from "react";

const RECONNECT_DELAY_MS = 3000;

export type StockSearchResult = {
	symbol: string;
	name: string;
};

type StockSearchMessage =
	| {
			type: "search_result";
			data: StockSearchResult[];
	  }
	| {
			type: "error";
			message: string;
	  };

type StockSearchSocketState = {
	results: StockSearchResult[];
	errorMessage: string | null;
	isConnected: boolean;
};

function getWebSocketBaseUrl(apiBaseUrl?: string) {
	if (!apiBaseUrl) {
		return "";
	}

	try {
		const url = new URL(apiBaseUrl);
		url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
		url.pathname = url.pathname.replace(/\/api\/?$/, "");
		url.search = "";
		url.hash = "";
		return url.toString().replace(/\/$/, "");
	} catch {
		return "";
	}
}

function getStockSearchSocketUrl() {
	const wsBaseUrl =
		import.meta.env.VITE_WS_BASE_URL ||
		getWebSocketBaseUrl(import.meta.env.VITE_API_BASE_URL);

	if (!wsBaseUrl) {
		return null;
	}

	return `${wsBaseUrl.replace(/\/$/, "")}/ws/stocks/search/`;
}

function parseSearchMessage(data: string): StockSearchMessage | null {
	try {
		const parsed = JSON.parse(data) as Partial<StockSearchMessage>;
		if (parsed.type === "search_result" && Array.isArray(parsed.data)) {
			return {
				type: "search_result",
				data: parsed.data.map((item) => ({
					symbol: String(item.symbol ?? ""),
					name: String(item.name ?? ""),
				})),
			};
		}
		if (parsed.type === "error") {
			return {
				type: "error",
				message: String(parsed.message ?? "검색 중 오류가 발생했습니다."),
			};
		}
		return null;
	} catch {
		return {
			type: "error",
			message: "검색 응답을 해석하지 못했습니다.",
		};
	}
}

export function useStockSearchSocket(keyword: string): StockSearchSocketState {
	const [results, setResults] = useState<StockSearchResult[]>([]);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [isConnected, setIsConnected] = useState(false);
	const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const socketRef = useRef<WebSocket | null>(null);
	const latestKeywordRef = useRef("");

	const socketUrl = useMemo(() => getStockSearchSocketUrl(), []);
	const normalizedKeyword = keyword.trim();

	useEffect(() => {
		if (reconnectTimerRef.current) {
			clearTimeout(reconnectTimerRef.current);
			reconnectTimerRef.current = null;
		}

		if (!socketUrl) {
			setErrorMessage("검색 웹소켓 주소가 설정되지 않았습니다.");
			return;
		}

		let shouldReconnect = true;

		const sendLatestKeyword = () => {
			const socket = socketRef.current;
			const currentKeyword = latestKeywordRef.current;
			if (!socket || socket.readyState !== WebSocket.OPEN || !currentKeyword) {
				return;
			}
			socket.send(JSON.stringify({ keyword: currentKeyword }));
		};

		const connect = () => {
			const socket = new WebSocket(socketUrl);
			socketRef.current = socket;

			socket.onopen = () => {
				setIsConnected(true);
				setErrorMessage(null);
				sendLatestKeyword();
			};

			socket.onmessage = (event) => {
				const message = parseSearchMessage(event.data);
				if (!message) {
					return;
				}

				if (message.type === "search_result") {
					setResults(message.data);
					setErrorMessage(null);
					return;
				}

				setErrorMessage(message.message);
			};

			socket.onerror = () => {
				setErrorMessage("종목 검색 연결 중 오류가 발생했습니다.");
			};

			socket.onclose = () => {
				setIsConnected(false);
				if (!shouldReconnect) {
					return;
				}
				reconnectTimerRef.current = setTimeout(connect, RECONNECT_DELAY_MS);
			};
		};

		connect();

		return () => {
			shouldReconnect = false;
			if (reconnectTimerRef.current) {
				clearTimeout(reconnectTimerRef.current);
				reconnectTimerRef.current = null;
			}
			socketRef.current?.close();
			socketRef.current = null;
		};
	}, [socketUrl]);

	useEffect(() => {
		latestKeywordRef.current = normalizedKeyword;

		if (!normalizedKeyword) {
			setResults([]);
			setErrorMessage(null);
			return;
		}

		const timer = setTimeout(() => {
			const socket = socketRef.current;
			if (!socket || socket.readyState !== WebSocket.OPEN) {
				return;
			}
			socket.send(JSON.stringify({ keyword: normalizedKeyword }));
		}, 200);

		return () => clearTimeout(timer);
	}, [normalizedKeyword]);

	return {
		results,
		errorMessage,
		isConnected,
	};
}
