import { BrowserRouter, Route, Routes } from "react-router-dom";
import AveragingCalculator from "@/pages/AveragingCalculator/AveragingCalculator";
import StockDetail from "@/pages/StockDetail/StockDetail";
import Stocks from "@/pages/Stocks/Stocks";
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

				{/* 4. 물타기 계산기 */}
				<Route path="/calculator/:stockId" element={<AveragingCalculator />} />
			</Routes>
		</BrowserRouter>
	);
}
