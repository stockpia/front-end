type SearchBarProps = {
	value: string;
	onChange: (value: string) => void;
	onSubmit: () => void;
};

export default function SearchBar({
	value,
	onChange,
	onSubmit,
}: SearchBarProps) {
	return (
		<form
			className="rounded-xl flex-1 flex border border-slate-200 bg-slate-50 px-4 py-3"
			onSubmit={(event) => {
				event.preventDefault();
				onSubmit();
			}}
		>
			<input
				id="stock-search-input"
				type="text"
				placeholder="종목명을 입력하세요"
				value={value}
				onChange={(event) => onChange(event.target.value)}
				className="flex-1 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
			/>
			<button
				type="submit"
				className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white"
			>
				검색
			</button>
		</form>
	);
}
