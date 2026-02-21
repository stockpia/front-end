type AccountInfoStepProps = {
	onNext: () => void;
	onPrev: () => void;
};

export default function AccountInfoStep({
	onNext,
	onPrev,
}: AccountInfoStepProps) {
	return (
		<section className="w-full rounded-xl border p-6">
			<h2 className="text-xl font-semibold">2. 계좌 정보 입력</h2>
			<div className="mt-5 text-left">
				<label className="block">
					<span className="mb-1 block text-sm">한투 계좌번호</span>
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
					className="rounded-lg border px-5 py-2 font-medium"
				>
					이전
				</button>
				<button
					type="button"
					onClick={onNext}
					className="rounded-lg bg-primary px-5 py-2 font-medium text-primary-foreground"
				>
					다음
				</button>
			</div>
		</section>
	);
}
