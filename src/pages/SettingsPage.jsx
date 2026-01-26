import { useState } from 'react';

export default function SettingsPage() {
  const [newsApiKey, setNewsApiKey] = useState(localStorage.getItem('news-api-key') || '');
  const [geminiApiKey, setGeminiApiKey] = useState(localStorage.getItem('gemini-api-key') || '');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem('news-api-key', newsApiKey);
    localStorage.setItem('gemini-api-key', geminiApiKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClearBookmarks = () => {
    if (window.confirm('すべてのブックマークを削除しますか？')) {
      localStorage.removeItem('us-markets-ai-bookmarks');
      window.location.reload();
    }
  };

  return (
    <div className="flex-1 pb-24 bg-[#141414]">
      <div className="py-5 px-5">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-[#E6E3DC] tracking-wide" style={{fontFamily: 'Georgia, serif'}}>Settings</h2>
          <p className="text-xs text-[#6B7280] mt-0.5 tracking-wider">設定</p>
        </div>

        <div className="space-y-5">
          <div className="p-5 rounded-2xl bg-[#1F242B] border border-[#2A2A2A] card-gold-border">
            <h3 className="text-sm font-semibold text-[#E6E3DC] mb-1">アプリについて</h3>
            <p className="text-xs text-[#9FA3A9] mb-4">
              US Markets AIは、米国株投資に役立つニュースをAIで分析するアプリです。
            </p>
            <div className="text-xs text-[#6B7280]">
              <p>バージョン: 1.0.0</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#1F242B] border border-[#2A2A2A]">
            <h3 className="text-sm font-semibold text-[#E6E3DC] mb-3">APIキー設定</h3>
            <p className="text-xs text-[#6B7280] mb-4">
              ※環境変数で設定済みの場合は入力不要です
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-[#9FA3A9] mb-1.5">ニュースAPIキー</label>
                <input
                  type="password"
                  value={newsApiKey}
                  onChange={(e) => setNewsApiKey(e.target.value)}
                  placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full py-3 px-4 rounded-xl bg-[#141414] border border-[#2A2A2A] text-[#E6E3DC] text-sm placeholder-[#6B7280] focus:outline-none focus:border-[#B59A5A]/50"
                />
              </div>

              <div>
                <label className="block text-xs text-[#9FA3A9] mb-1.5">Gemini APIキー</label>
                <input
                  type="password"
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full py-3 px-4 rounded-xl bg-[#141414] border border-[#2A2A2A] text-[#E6E3DC] text-sm placeholder-[#6B7280] focus:outline-none focus:border-[#B59A5A]/50"
                />
              </div>

              <button
                onClick={handleSave}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#B59A5A] to-[#9C8450] text-[#141414] text-sm font-semibold hover:shadow-lg hover:shadow-[#B59A5A]/20 transition-all duration-300"
              >
                {saved ? '保存しました!' : '保存'}
              </button>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#1F242B] border border-[#2A2A2A]">
            <h3 className="text-sm font-semibold text-[#E6E3DC] mb-3">データ管理</h3>

            <button
              onClick={handleClearBookmarks}
              className="w-full py-3 rounded-xl bg-[#A65D57]/10 border border-[#A65D57]/30 text-[#D4847E] text-sm font-medium hover:bg-[#A65D57]/20 transition-all duration-300"
            >
              ブックマークをすべて削除
            </button>
          </div>

          <div className="p-5 rounded-2xl bg-[#1F242B] border border-[#2A2A2A]">
            <h3 className="text-sm font-semibold text-[#E6E3DC] mb-3">リンク</h3>

            <div className="space-y-2">
              <a
                href="https://newsapi.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between py-2.5 text-sm text-[#9FA3A9] hover:text-[#B59A5A] transition-colors duration-300"
              >
                <span>ニュースAPI公式サイト</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
              <a
                href="https://ai.google.dev/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between py-2.5 text-sm text-[#9FA3A9] hover:text-[#B59A5A] transition-colors duration-300"
              >
                <span>Google AI Studio（Gemini）</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
