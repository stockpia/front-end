export default function SearchBar() {
  return (
    <form className="rounded-xl flex-1 flex border border-slate-200 bg-slate-50 px-4 py-3">
      <input
        id="stock-search-input"
        type="text"
        placeholder="종목명을 입력하세요"
        className="flex-1 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
      />
      <button
        type="button"
        className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white">
        검색
      </button>
    </form>
  );
}
