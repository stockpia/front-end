export default function AveragingCalculator() {
  return (
    <div className="space-y-8 py-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_40px_-32px_rgba(15,23,42,0.6)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              물타기 계산기
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              현재 보유 현황과 추가 매수 계획을 입력하면 새로운 평균 단가를
              계산합니다.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
