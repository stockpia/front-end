type BasicInfoStepProps = {
  onNext: () => void;
};

export default function BasicInfoStep({ onNext }: BasicInfoStepProps) {
  return (
    <section className="w-full rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_40px_-32px_rgba(15,23,42,0.6)]">
      <div className="mt-5 space-y-8 text-left">
        <label className="block">
          <span className="mb-1 block text-sm">이름</span>
          <input
            className="w-full rounded-md border px-3 py-2"
            type="text"
            placeholder="홍길동"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm">생년월일</span>
          <input
            className="w-full rounded-md border px-3 py-2"
            type="text"
            placeholder="19900101"
          />
        </label>
      </div>
      <div className="mt-6 flex justify-end">
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
