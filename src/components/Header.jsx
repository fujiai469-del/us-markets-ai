export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-[#141414] via-[#1C1B1A] to-[#1F1E1B]">
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3">
          {/* 月桂冠アイコン */}
          <div className="w-10 h-10 flex items-center justify-center">
            <svg className="w-8 h-8 text-[#B59A5A]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C9.5 5 9 8 10 11c-2-2-5-3-8-2 2 2 3 5 2 8 3-1 6-1 8 1-1-3-1-6 1-8-3 1-6 0-8-2 3-1 6 0 8 2-1-3 0-6 2-8-2 3-3 6-2 8 2-2 5-3 8-2-2 2-3 5-2 8-3-1-6-1-8 1 1-3 1-6-1-8 3 1 6 0 8 2-1-3 0-6-2-8z" opacity="0.9"/>
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wide text-gold-gradient" style={{fontFamily: 'Georgia, serif'}}>
              US Markets
            </h1>
            <span className="text-xs text-[#9FA3A9] tracking-widest uppercase">AI News</span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-full bg-[#1F242B] border border-[#2A2A2A] flex items-center justify-center">
          <svg className="w-5 h-5 text-[#9FA3A9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
      </div>
      {/* 下部のゴールドライン */}
      <div className="h-[1px] bg-gradient-to-r from-transparent via-[#B59A5A]/30 to-transparent" />
    </header>
  );
}
