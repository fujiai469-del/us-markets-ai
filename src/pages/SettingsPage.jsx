import { useState, useEffect } from 'react';

export default function SettingsPage() {
  // テーマ設定
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('us-markets-theme') === 'dark';
  });

  // 文字サイズ設定
  const [fontSize, setFontSize] = useState(() => {
    return localStorage.getItem('us-markets-font-size') || 'medium';
  });

  // テーマ変更時の処理
  useEffect(() => {
    localStorage.setItem('us-markets-theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  // 文字サイズ変更時の処理
  useEffect(() => {
    localStorage.setItem('us-markets-font-size', fontSize);
    document.documentElement.classList.remove('font-small', 'font-medium', 'font-large');
    document.documentElement.classList.add(`font-${fontSize}`);
  }, [fontSize]);

  const handleClearBookmarks = () => {
    if (window.confirm('保存した記事をすべて削除しますか？')) {
      localStorage.removeItem('us-markets-ai-bookmarks');
      window.location.reload();
    }
  };

  return (
    <div className="flex-1 pt-8" style={{ paddingBottom: '200px' }}>
      <div className="main-container">
        {/* Section Header - Extra breathing room */}
        <div className="mb-12 sm:mb-16 pt-6 sm:pt-8">
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-heading)]">
            設定
          </h2>
          <p className="text-sm text-[var(--text-muted)] mt-3 leading-relaxed">
            アプリの設定をカスタマイズ
          </p>
        </div>

        {/* Settings Sections - Very large spacing: space-y-16 (64px) on mobile, space-y-20 (80px) on desktop */}
        <div className="space-y-16 sm:space-y-20">

          {/* About - Extra padding */}
          <div className="p-7 sm:p-10 neu-card">
            <h3 className="text-sm sm:text-base font-semibold text-[var(--text-heading)] mb-6 flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-[var(--accent-blue)]/10">
                <svg className="w-5 h-5 text-[var(--accent-blue)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              このアプリについて
            </h3>
            <p className="text-sm sm:text-base text-[var(--text-body)] mb-6 leading-loose">
              US Markets AI は、AI を活用した米国マーケットニュースの分析・翻訳アプリです。
            </p>
            <div className="flex items-center gap-4 text-xs sm:text-sm text-[var(--text-muted)]">
              <span>Version 1.0.0</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--shadow-dark)]" />
              <span>Neumorphic Edition</span>
            </div>
          </div>

          {/* テーマ設定 - Extra padding and spacing */}
          <div className="p-7 sm:p-10 neu-card">
            <h3 className="text-sm sm:text-base font-semibold text-[var(--text-heading)] mb-8 flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-[var(--accent-blue)]/10">
                <svg className="w-5 h-5 text-[var(--accent-blue)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              </div>
              テーマ設定
            </h3>

            <div className="flex items-center justify-between py-2">
              <div>
                <span className="text-base font-medium text-[var(--text-body)]">
                  {isDarkMode ? 'ダークモード' : 'ライトモード'}
                </span>
                <p className="text-sm text-[var(--text-muted)] mt-2 leading-relaxed">
                  画面の明るさを切り替えます
                </p>
              </div>
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`relative w-16 h-9 rounded-full transition-all duration-300 ${isDarkMode
                  ? 'bg-[var(--accent-blue)]'
                  : 'neu-inset'
                  }`}
              >
                <span
                  className={`absolute top-1.5 w-6 h-6 rounded-full transition-all duration-300 ${isDarkMode
                    ? 'left-8 bg-white shadow-lg'
                    : 'left-1.5 bg-[var(--bg-primary)] neu-raised-sm'
                    }`}
                />
              </button>
            </div>
          </div>

          {/* 文字サイズ設定 - Extra padding */}
          <div className="p-7 sm:p-10 neu-card">
            <h3 className="text-sm sm:text-base font-semibold text-[var(--text-heading)] mb-8 flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-[var(--accent-blue)]/10">
                <svg className="w-5 h-5 text-[var(--accent-blue)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              </div>
              文字サイズ
            </h3>

            <div className="flex gap-4 sm:gap-5">
              {[
                { value: 'small', label: '小', preview: 'A' },
                { value: 'medium', label: '中', preview: 'A' },
                { value: 'large', label: '大', preview: 'A' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFontSize(option.value)}
                  className={`flex-1 py-5 sm:py-6 rounded-xl transition-all duration-200 ${fontSize === option.value
                    ? 'neu-inset text-[var(--accent-blue)]'
                    : 'neu-raised-sm text-[var(--text-muted)] hover:text-[var(--text-body)]'
                    }`}
                >
                  <span className={`block font-bold ${option.value === 'small' ? 'text-base' :
                    option.value === 'medium' ? 'text-lg' : 'text-xl'
                    }`}>
                    {option.preview}
                  </span>
                  <span className="block text-xs sm:text-sm mt-2">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Data Management - Extra padding */}
          <div className="p-7 sm:p-10 neu-card">
            <h3 className="text-sm sm:text-base font-semibold text-[var(--text-heading)] mb-8 flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-[var(--accent-blue)]/10">
                <svg className="w-5 h-5 text-[var(--accent-blue)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
              </div>
              データ管理
            </h3>

            <button
              onClick={handleClearBookmarks}
              className="w-full py-5 rounded-xl bg-red-50 border border-red-200 text-sm sm:text-base font-medium text-red-600 hover:bg-red-100 transition-all duration-200 min-h-[56px]"
            >
              保存した記事をすべて削除
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
