type AccountInfoStepProps = {
  onNext: () => void;
  onPrev: () => void;
};

export default function AccountInfoStep({
  onNext,
  onPrev,
}: AccountInfoStepProps) {
  return (
    <section className="w-full rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_40px_-32px_rgba(15,23,42,0.6)]">
      <h2 className="text-xl font-semibold">계좌 정보 입력</h2>
      <div className="mt-5 text-left">
        <label className="block">
          <input
            className="w-full rounded-md border px-3 py-2"
            type="text"
            placeholder="계좌번호를 입력하세요"
          />
        </label>
      </div>
      <div className="mt-6 flex justify-between">
        <button
          type="button"
          onClick={onPrev}
          className="rounded-lg border px-5 py-2 font-medium">
          이전
        </button>
        <button
          type="button"
          onClick={onNext}
          className="rounded-lg bg-primary px-5 py-2 font-medium text-primary-foreground">
          다음
        </button>
      </div>
    </section>
  );
}
