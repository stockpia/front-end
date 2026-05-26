import { api } from "@/lib/api/axios";
import type {
  StockOrderBookItem,
  StockOrderBookResponse,
} from "@/types/stocks";

type StockOrderBookErrorResponse = {
  error?: string;
  message?: string;
};

function isOrderBookItem(value: unknown): value is StockOrderBookItem {
  if (!value || typeof value !== "object") {
    return false;
  }

  const item = value as Partial<StockOrderBookItem>;
  return typeof item.price === "number" && typeof item.quantity === "number";
}

function toStockOrderBookResponse(data: unknown): StockOrderBookResponse {
  if (!data || typeof data !== "object") {
    throw new Error("호가 조회 응답 형식이 올바르지 않습니다.");
  }

  const errorResponse = data as StockOrderBookErrorResponse;
  if (errorResponse.error || errorResponse.message) {
    throw new Error(errorResponse.error ?? errorResponse.message);
  }

  const response = data as Partial<StockOrderBookResponse>;
  if (
    typeof response.symbol !== "string" ||
    !Array.isArray(response.asks) ||
    !Array.isArray(response.bids) ||
    !response.asks.every(isOrderBookItem) ||
    !response.bids.every(isOrderBookItem) ||
    typeof response.trade_strength !== "number"
  ) {
    throw new Error("호가 조회 응답 형식이 올바르지 않습니다.");
  }

  return {
    symbol: response.symbol,
    asks: response.asks,
    bids: response.bids,
    trade_strength: response.trade_strength,
  };
}

export async function fetchStockOrderBook(
  ticker: string,
  signal?: AbortSignal,
) {
  const { data } = await api.get<unknown>(
    `/web/stocks/${encodeURIComponent(ticker)}/orderbook`,
    { signal },
  );
  return toStockOrderBookResponse(data);
}
