import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "@/pages/Home/Home";
import Login from "@/pages/Login/Login";
import StockDetail from "@/pages/StockDetail/StockDetail";
import TradeDetail from "@/pages/TradeDetail/TradeDetail";

export default function AppRouter() {
	return (
		<BrowserRouter>
			<Routes>
				{/* 1. 홈 */}
				<Route path="/" element={<Home />} />

				{/* 2. 종목 상세 */}
				<Route path="/stocks/:stockId" element={<StockDetail />} />

				{/* 3. 거래내역 상세 */}
				<Route path="/trades/:userId" element={<TradeDetail />} />

				{/* 4. 주식 계좌 연동 로그인 */}
				<Route path="/login" element={<Login />} />
			</Routes>
		</BrowserRouter>
	);
}
