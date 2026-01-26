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
    <div className="flex-1 pb-24">
      <div className="py-4 px-4">
        <h2 className="text-lg font-bold text-white mb-6">設定</h2>

        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/50">
            <h3 className="text-sm font-semibold text-white mb-1">アプリについて</h3>
            <p className="text-xs text-slate-400 mb-4">
              US Markets AIは、米国株投資に役立つニュースをAIで分析するアプリです。
            </p>
            <div className="text-xs text-slate-500">
              <p>バージョン: 1.0.0</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/50">
            <h3 className="text-sm font-semibold text-white mb-3">APIキー設定</h3>
            <p className="text-xs text-slate-400 mb-4">
              ※環境変数で設定済みの場合は入力不要です
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">ニュースAPIキー</label>
                <input
                  type="password"
                  value={newsApiKey}
                  onChange={(e) => setNewsApiKey(e.target.value)}
                  placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full py-2.5 px-3 rounded-lg bg-slate-700/50 border border-slate-600/50 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Gemini APIキー</label>
                <input
                  type="password"
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full py-2.5 px-3 rounded-lg bg-slate-700/50 border border-slate-600/50 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <button
                onClick={handleSave}
                className="w-full py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-semibold hover:shadow-lg hover:shadow-cyan-500/20 transition-all"
              >
                {saved ? '保存しました!' : '保存'}
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/50">
            <h3 className="text-sm font-semibold text-white mb-3">データ管理</h3>

            <button
              onClick={handleClearBookmarks}
              className="w-full py-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-all"
            >
              ブックマークをすべて削除
            </button>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/50">
            <h3 className="text-sm font-semibold text-white mb-3">リンク</h3>

            <div className="space-y-2">
              <a
                href="https://newsapi.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between py-2 text-sm text-slate-300 hover:text-white transition-colors"
              >
                <span>ニュースAPI公式サイト</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
              <a
                href="https://ai.google.dev/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between py-2 text-sm text-slate-300 hover:text-white transition-colors"
              >
                <span>Google AI Studio（Gemini）</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
