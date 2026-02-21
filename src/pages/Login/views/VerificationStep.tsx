type VerificationStepProps = {
	onPrev: () => void;
};

export default function VerificationStep({ onPrev }: VerificationStepProps) {
	return (
		<section className="w-full rounded-xl border p-6">
			<h2 className="text-xl font-semibold">3. 본인 확인</h2>
			<div className="mt-5 space-y-4 text-left">
				<div className="flex gap-2">
					<input
						className="flex-1 rounded-md border px-3 py-2"
						type="text"
						placeholder="전화번호 입력"
					/>
					<button
						type="button"
						className="rounded-lg border px-4 py-2 font-medium"
					>
						인증번호 전송
					</button>
				</div>
				<label className="block">
					<span className="mb-1 block text-sm">인증번호 입력</span>
					<input
						className="w-full rounded-md border px-3 py-2"
						type="text"
						placeholder="인증번호 6자리"
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
					className="rounded-lg bg-primary px-5 py-2 font-medium text-primary-foreground"
				>
					확인
				</button>
			</div>
		</section>
	);
}
