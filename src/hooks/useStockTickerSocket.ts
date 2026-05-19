import { useEffect, useMemo, useRef, useState } from "react";

const RECONNECT_DELAY_MS = 3000;

export type StockTickerUpdate = {
	type: "ticker_update";
	symbol: string;
	price: number;
	change: number;
	change_rate: number;
};

type StockTickerError = {
	type: "error";
	message: string;
};

type StockTickerMessage = StockTickerUpdate | StockTickerError;

type StockTickerSocketState = {
	ticker: StockTickerUpdate | null;
	errorMessage: string | null;
	isConnected: boolean;
};

function getStockTickerSocketUrl(symbol: string) {
	const wsBaseUrl =
		import.meta.env.VITE_WS_BASE_URL ||
		getWebSocketBaseUrl(import.meta.env.VITE_API_BASE_URL);

	if (!wsBaseUrl) {
		return null;
	}

	return `${wsBaseUrl.replace(/\/$/, "")}/ws/stocks/ticker/${encodeURIComponent(
		symbol,
	)}/`;
}

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

function parseTickerMessage(data: string): StockTickerMessage | null {
	try {
		const parsed = JSON.parse(data) as Partial<StockTickerMessage>;
		if (parsed.type === "ticker_update") {
			return {
				type: "ticker_update",
				symbol: String(parsed.symbol ?? ""),
				price: Number(parsed.price),
				change: Number(parsed.change),
				change_rate: Number(parsed.change_rate),
			};
		}
		if (parsed.type === "error") {
			return {
				type: "error",
				message: String(parsed.message ?? "시세 정보를 가져오지 못했습니다."),
			};
		}
		return null;
	} catch {
		return {
			type: "error",
			message: "시세 응답을 해석하지 못했습니다.",
		};
	}
}

export function useStockTickerSocket(
	symbol?: string | null,
	enabled = true,
): StockTickerSocketState {
	const [ticker, setTicker] = useState<StockTickerUpdate | null>(null);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [isConnected, setIsConnected] = useState(false);
	const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const socketRef = useRef<WebSocket | null>(null);

	const socketUrl = useMemo(() => {
		if (!symbol) {
			return null;
		}
		return getStockTickerSocketUrl(symbol);
	}, [symbol]);

	useEffect(() => {
		if (reconnectTimerRef.current) {
			clearTimeout(reconnectTimerRef.current);
			reconnectTimerRef.current = null;
		}

		socketRef.current?.close();
		socketRef.current = null;
		setTicker(null);
		setIsConnected(false);

		if (!enabled || !symbol || !socketUrl) {
			setErrorMessage(socketUrl ? null : "웹소켓 주소가 설정되지 않았습니다.");
			return;
		}

		let shouldReconnect = true;

		const connect = () => {
			const socket = new WebSocket(socketUrl);
			socketRef.current = socket;

			socket.onopen = () => {
				setIsConnected(true);
				setErrorMessage(null);
			};

			socket.onmessage = (event) => {
				const message = parseTickerMessage(event.data);
				if (!message) {
					return;
				}

				if (message.type === "ticker_update") {
					if (message.symbol === symbol) {
						setTicker(message);
						setErrorMessage(null);
					}
					return;
				}

				setErrorMessage(message.message);
			};

			socket.onerror = () => {
				setErrorMessage("실시간 시세 연결 중 오류가 발생했습니다.");
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
	}, [enabled, socketUrl, symbol]);

	return {
		ticker,
		errorMessage,
		isConnected,
	};
}
