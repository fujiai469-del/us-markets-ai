export default function Header() {
  return (
    <header className="sticky top-0 z-50 glass-effect border-b border-slate-700/50">
      <div className="flex items-center justify-between px-4 py-3">
        <h1 className="text-xl font-bold gradient-text">米国株AIニュース</h1>
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
      </div>
    </header>
  );
}
