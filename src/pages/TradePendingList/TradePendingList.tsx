import { useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

type PendingFilter = "all" | "sell" | "buy";

function formatCurrency(value: number) {
  return `${Math.round(value).toLocaleString("ko-KR")}원`;
}

export default function TradePendingList() {
  const navigate = useNavigate();
  const { stockId } = useParams();
  const [searchParams] = useSearchParams();
  const [activeFilter, setActiveFilter] = useState<PendingFilter>("all");

  const stockName = searchParams.get("name")
    ? decodeURIComponent(searchParams.get("name") as string)
    : stockId;

  const [pendingOrders, setPendingOrders] = useState([
    {
      id: `${stockId}-sell-1`,
      status: "접수 대기",
      side: "sell" as const,
      orderType: "지정가 매도",
      price: 82300,
      quantity: 8,
      requestedAt: "2026-03-27 09:12",
    },
    {
      id: `${stockId}-buy-1`,
      status: "체결 대기",
      side: "buy" as const,
      orderType: "현재가 매수",
      price: 81400,
      quantity: 7,
      requestedAt: "2026-03-27 09:25",
    },
    {
      id: `${stockId}-buy-2`,
      status: "접수 대기",
      side: "buy" as const,
      orderType: "지정가 매수",
      price: 80900,
      quantity: 15,
      requestedAt: "2026-03-27 09:31",
    },
  ]);

  const filteredOrders = useMemo(() => {
    if (activeFilter === "all") {
      return pendingOrders;
    }

    return pendingOrders.filter((order) => order.side === activeFilter);
  }, [activeFilter, pendingOrders]);

  return (
    <div className="space-y-6 py-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_40px_-32px_rgba(15,23,42,0.6)]">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-sm font-medium text-slate-500 transition hover:text-slate-800">
          이전으로
        </button>
        <h1 className="mt-3 text-2xl font-semibold text-slate-900">
          체결 대기 목록
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          {stockName ?? "종목"} ({stockId ?? "-"}) 기준의 대기 주문입니다.
        </p>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_40px_-32px_rgba(15,23,42,0.6)]">
        <div className="flex justify-end mb-4">
          <div className="inline-flex items-center rounded-full bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setActiveFilter("all")}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                activeFilter === "all"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}>
              전체
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("sell")}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                activeFilter === "sell"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}>
              매도
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("buy")}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                activeFilter === "buy"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}>
              매수
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {filteredOrders.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
              선택한 조건의 체결 대기 주문이 없습니다.
            </div>
          )}

          {filteredOrders.map((order) => (
            <article
              key={order.id}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {order.orderType}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    요청 시각 {order.requestedAt}
                  </p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                  {order.status}
                </span>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-white px-4 py-3">
                  <p className="text-xs text-slate-500">주문 단가</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {formatCurrency(order.price)}
                  </p>
                </div>
                <div className="rounded-2xl bg-white px-4 py-3">
                  <p className="text-xs text-slate-500">주문 수량</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {order.quantity.toLocaleString("ko-KR")}주
                  </p>
                </div>
                <div className="rounded-2xl bg-white px-4 py-3">
                  <p className="text-xs text-slate-500">총 주문 금액</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {formatCurrency(order.price * order.quantity)}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() =>
                    setPendingOrders((prev) =>
                      prev.filter((item) => item.id !== order.id),
                    )
                  }
                  className="rounded-full border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-500 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600">
                  삭제하기
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
