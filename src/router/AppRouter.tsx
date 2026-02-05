import { BrowserRouter, Route, Routes } from "react-router-dom";
import Stocks from "@/pages/Stocks/Stocks";
import StockDetail from "@/pages/StockDetail/StockDetail";
import TradeDetail from "@/pages/TradeDetail/TradeDetail";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 1. 홈 */}
        <Route path="/" element={<Stocks />} />

        {/* 2. 종목 상세 */}
        <Route path="/stocks/:stockId" element={<StockDetail />} />

        {/* 3. 거래내역 상세 */}
        <Route path="/trades/:userId" element={<TradeDetail />} />
      </Routes>
    </BrowserRouter>
  );
}
