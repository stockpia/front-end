import { api } from "@/lib/api/axios";
import type { TradeDetailResponse, TradePeriod } from "@/mocks/tradeDetail";

export type FetchTradeDetailParams = {
  user_id?: string;
  period?: TradePeriod;
};

export async function fetchTradeDetail(
  symbol: string,
  params: FetchTradeDetailParams,
  signal?: AbortSignal,
) {
  const { data } = await api.get<TradeDetailResponse>(
    `/web/stocks/${symbol}/detail`,
    {
      params,
      signal,
    },
  );
  return data;
}
