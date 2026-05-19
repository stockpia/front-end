import { Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function HomeButton() {
	const navigate = useNavigate();

	return (
		<button
			type="button"
			onClick={() => navigate("/")}
			aria-label="홈으로 가기"
			className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
		>
			<Home className="h-4 w-4" />
		</button>
	);
}
