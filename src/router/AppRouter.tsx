import { BrowserRouter, Route, Routes } from "react-router-dom";
import { RootLayout } from "@/layouts/RootLayout";
import Home from "@/pages/Home/Home";
import InvestmentProfile from "@/pages/InvestmentProfile/InvestmentProfile";
import Login from "@/pages/Login/Login";
import MyPage from "@/pages/MyPage/MyPage";
import StockDetail from "@/pages/StockDetail/StockDetail";
import Stocks from "@/pages/Stocks/Stocks";
import TradeDetail from "@/pages/TradeDetail/TradeDetail";

export default function AppRouter() {
	return (
		<BrowserRouter>
			<RootLayout>
				<Routes>
					{/* 1. 홈 */}
					<Route path="/" element={<Home />} />
					<Route path="/stocks" element={<Stocks />} />

					{/* 2. 종목 상세 */}
					<Route path="/stocks/:stockId" element={<StockDetail />} />

					{/* 3. 거래내역 상세 */}
					<Route path="/trades/:userId" element={<TradeDetail />} />

					{/* 5. 주식 계좌 연동 로그인 */}
					<Route path="/login" element={<Login />} />

					{/* 6. 마이페이지 */}
					<Route path="/mypage" element={<MyPage />} />
					<Route
						path="/mypage/investment-profile"
						element={<InvestmentProfile />}
					/>
				</Routes>
			</RootLayout>
		</BrowserRouter>
	);
}
