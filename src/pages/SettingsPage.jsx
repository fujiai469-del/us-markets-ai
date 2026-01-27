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
    if (window.confirm('Clear all saved articles?')) {
      localStorage.removeItem('us-markets-ai-bookmarks');
      window.location.reload();
    }
  };

  return (
    <div className="flex-1 pb-24">
      <div className="py-6 px-5">
        {/* Section Header */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-[#1a1a2e]">
            Settings
          </h2>
          <p className="text-xs text-[#718096] mt-0.5">
            Configure your app
          </p>
        </div>

        <div className="space-y-5">
          {/* About */}
          <div className="p-5 neu-card">
            <h3 className="text-sm font-semibold text-[#1a1a2e] mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-[#3b82f6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              About
            </h3>
            <p className="text-sm text-[#4a5568] mb-4 leading-relaxed">
              US Markets AI provides AI-powered analysis of market news.
            </p>
            <div className="flex items-center gap-4 text-xs text-[#718096]">
              <span>Version 1.0.0</span>
              <span className="w-1 h-1 rounded-full bg-[#c8d0e7]" />
              <span>Neumorphic Edition</span>
            </div>
          </div>

          {/* API Keys */}
          <div className="p-5 neu-card">
            <h3 className="text-sm font-semibold text-[#1a1a2e] mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-[#3b82f6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              API Keys
            </h3>
            <p className="text-xs text-[#718096] mb-5">
              * Not required if configured via environment variables
            </p>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-medium text-[#4a5568] mb-2">
                  News API Key
                </label>
                <input
                  type="password"
                  value={newsApiKey}
                  onChange={(e) => setNewsApiKey(e.target.value)}
                  placeholder="Enter your key..."
                  className="input-neu w-full py-3 px-4"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#4a5568] mb-2">
                  Gemini API Key
                </label>
                <input
                  type="password"
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="input-neu w-full py-3 px-4"
                />
              </div>

              <button
                onClick={handleSave}
                className={`btn-neu-primary w-full transition-all duration-300 ${saved ? 'bg-green-500' : ''}`}
              >
                {saved ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    Saved!
                  </span>
                ) : 'Save Settings'}
              </button>
            </div>
          </div>

          {/* Data Management */}
          <div className="p-5 neu-card">
            <h3 className="text-sm font-semibold text-[#1a1a2e] mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 text-[#3b82f6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
              Data Management
            </h3>

            <button
              onClick={handleClearBookmarks}
              className="w-full py-3 rounded-xl bg-red-50 border border-red-200 text-sm font-medium text-red-600 hover:bg-red-100 transition-all duration-200"
            >
              Clear All Saved Articles
            </button>
          </div>

          {/* Links */}
          <div className="p-5 neu-card">
            <h3 className="text-sm font-semibold text-[#1a1a2e] mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 text-[#3b82f6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              Resources
            </h3>

            <div className="space-y-1">
              <a
                href="https://newsapi.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between py-3.5 text-sm text-[#4a5568] hover:text-[#3b82f6] transition-colors duration-200 border-b border-[#e8eef4] group"
              >
                <span>News API Official Site</span>
                <svg className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
              <a
                href="https://ai.google.dev/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between py-3.5 text-sm text-[#4a5568] hover:text-[#3b82f6] transition-colors duration-200 group"
              >
                <span>Google AI Studio (Gemini)</span>
                <svg className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
