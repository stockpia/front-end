import {
	ArrowRight,
	BarChart3,
	BellRing,
	Bot,
	BriefcaseBusiness,
	FileText,
	MessageSquareText,
	MousePointerClick,
	ShoppingBag,
	Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";

const services = [
	{
		title: "종목 차트",
		description: "다양한 차트로 주가 흐름을 한눈에 파악하세요.",
		icon: BarChart3,
	},
	{
		title: "종목 리포트",
		description:
			"재무제표를 몰라도 괜찮아요. AI가 기업의 핵심 가치와 상태를 3줄로 쉽게 요약해줘요.",
		icon: FileText,
	},
	{
		title: "뉴스/커뮤니티",
		description:
			"수많은 뉴스 중 내 주식에 진짜 영향을 미칠 핵심 호재/악재만 필터링해서 보여드려요.",
		icon: MessageSquareText,
	},
	{
		title: "거래 상세 리포트",
		description:
			"내가 언제, 얼마에 사고팔았는지. 투자 기록을 꼼꼼하게 정리해 드립니다.",
		icon: BriefcaseBusiness,
	},
	{
		title: "매수/매도",
		description:
			"복잡한 인증 절차 없이, 원하는 타이밍에 가장 쉽고 빠르게 주문을 넣을 수 있습니다.",
		icon: ShoppingBag,
	},
	{
		title: "주식 AI 알림",
		description:
			"매일 아침 투자 전략부터 장 마감 요약까지. Telegram으로 가장 먼저 알려드릴게요.",
		icon: BellRing,
	},
];

const previewItems = [
	{ label: "AI 요약", value: "실적 개선 기대" },
	{ label: "주요 체크", value: "환율 변동성" },
	{ label: "알림", value: "개장 전 전략 도착" },
];

export default function Home() {
	return (
		<div className="min-h-svh bg-white pb-10">
			<header className="flex items-center justify-between py-5">
				<Link to="/" className="text-lg font-black tracking-tight text-slate-950">
					M.A.T.E
				</Link>
				<Link
					to="/login"
					className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
				>
					로그인
				</Link>
			</header>

			<main>
				<section className="pt-10 pb-16">
					<div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
						<Sparkles className="h-3.5 w-3.5" />
						AI 투자 M.A.T.E
					</div>
					<h1 className="mt-5 text-[2.45rem] leading-[1.1] font-black tracking-tight text-slate-950">
						복잡한 주식 창은 끄고,
						<br />
						필요한 정보만
						<br />
						M.A.T.E에게.
					</h1>
					<p className="mt-5 text-lg leading-8 font-semibold text-slate-500">
						차트, 리포트, 뉴스, 거래 기록까지 투자 판단에 필요한 흐름을
						쉽게 정리해 드려요.
					</p>
					<div className="mt-8 flex flex-col gap-3 sm:flex-row">
						<Link
							to="/stocks"
							className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-4 text-base font-bold text-white transition hover:bg-slate-800"
						>
							종목 보러 가기
							<ArrowRight className="h-5 w-5" />
						</Link>
						<Link
							to="/login"
							className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-100 px-5 py-4 text-base font-bold text-slate-800 transition hover:bg-slate-200"
						>
							계좌 연동하기
						</Link>
					</div>

					<div className="mt-12 rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_54px_-42px_rgba(15,23,42,0.55)]">
						<div>
							<div className="flex items-center justify-between">
								<div>
									<p className="text-xs font-bold text-slate-400">
										Today M.A.T.E
									</p>
									<p className="mt-1 text-xl font-black">삼성전자 리포트</p>
								</div>
								<div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
									<Bot className="h-6 w-6" />
								</div>
							</div>
							<div className="mt-5 space-y-3">
								{previewItems.map((item) => (
									<div
										key={item.label}
										className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"
									>
										<span className="text-sm font-semibold text-slate-500">
											{item.label}
										</span>
										<span className="text-sm font-black text-slate-900">
											{item.value}
										</span>
									</div>
								))}
							</div>
							<div className="mt-5 rounded-2xl bg-slate-50 p-4">
								<p className="text-sm leading-6 font-semibold text-slate-700">
									오늘은 반도체 업황 개선 기대가 커졌어요. 단기 변동성은
									있지만, 장 마감 후 수급 변화도 함께 확인해 보세요.
								</p>
							</div>
						</div>
					</div>
				</section>

				<section className="py-14">
					<p className="text-sm font-black text-slate-500">서비스 소개</p>
					<h2 className="mt-3 text-3xl leading-tight font-black tracking-tight text-slate-950">
						투자할 때 자주 여는 화면을
						<br />
						하나로 모았어요.
					</h2>
					<div className="mt-8 divide-y divide-slate-100 rounded-[28px] border border-slate-200 bg-white">
						{services.map((service) => {
							const Icon = service.icon;
							return (
								<article
									key={service.title}
									className="p-5"
								>
									<div className="flex items-start gap-4">
										<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
											<Icon className="h-6 w-6" />
										</div>
										<div className="min-w-0">
											<h3 className="text-base font-black text-slate-950">
												{service.title}
											</h3>
											<p className="mt-1 text-sm leading-6 font-semibold text-slate-500">
												{service.description}
											</p>
										</div>
									</div>
								</article>
							);
						})}
					</div>
				</section>

				<section className="rounded-[32px] bg-slate-100 p-6">
					<div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
						<MousePointerClick className="h-6 w-6" />
					</div>
					<h2 className="mt-5 text-2xl leading-tight font-black text-slate-950">
						읽고, 판단하고,
						<br />
						바로 주문까지.
					</h2>
					<p className="mt-3 text-sm leading-6 font-semibold text-slate-500">
						종목을 고르면 실시간 가격, AI 리포트, 뉴스와 커뮤니티
						흐름을 한 화면에서 확인할 수 있어요.
					</p>
					<Link
						to="/stocks"
						className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-4 text-base font-bold text-white transition hover:bg-slate-800"
					>
						M.A.T.E 시작하기
						<ArrowRight className="h-5 w-5" />
					</Link>
				</section>
			</main>
		</div>
	);
}
