type BasicInfoStepProps = {
	name: string;
	birthDate: string;
	phoneNumber: string;
	onChangeName: (value: string) => void;
	onChangeBirthDate: (value: string) => void;
	onChangePhoneNumber: (value: string) => void;
	onNext: () => void;
};

export default function BasicInfoStep({
	name,
	birthDate,
	phoneNumber,
	onChangeName,
	onChangeBirthDate,
	onChangePhoneNumber,
	onNext,
}: BasicInfoStepProps) {
	const isNextDisabled =
		!name.trim() || !birthDate.trim() || !phoneNumber.trim();

	return (
		<section className="w-full rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_40px_-32px_rgba(15,23,42,0.6)]">
			<div className="mt-5 space-y-8 text-left">
				<label className="block">
					<span className="mb-1 block text-sm">이름</span>
					<input
						className="w-full rounded-md border px-3 py-2"
						type="text"
						placeholder="홍길동"
						value={name}
						onChange={(event) => onChangeName(event.target.value)}
					/>
				</label>
				<label className="block">
					<span className="mb-1 block text-sm">생년월일</span>
					<input
						className="w-full rounded-md border px-3 py-2"
						type="text"
						placeholder="19900101"
						value={birthDate}
						onChange={(event) => onChangeBirthDate(event.target.value)}
					/>
				</label>

				<label className="block">
					<span className="mb-1 block text-sm">전화번호</span>
					<input
						className="w-full rounded-md border px-3 py-2"
						type="tel"
						placeholder="01012345678"
						value={phoneNumber}
						onChange={(event) => onChangePhoneNumber(event.target.value)}
					/>
				</label>
			</div>
			<div className="mt-6 flex justify-end">
				<button
					type="button"
					onClick={onNext}
					disabled={isNextDisabled}
					className="rounded-lg bg-primary px-5 py-2 font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
				>
					다음
				</button>
			</div>
		</section>
	);
}
