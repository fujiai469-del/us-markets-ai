import { useState } from 'react';
import { POPULAR_TICKERS } from '../hooks/useWatchlist';

export default function WatchlistModal({ isOpen, onClose, watchlist, addTicker, removeTicker }) {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  if (!isOpen) return null;

  const handleAdd = (ticker) => {
    if (ticker) {
      addTicker(ticker);
      setInputValue('');
      setShowSuggestions(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleAdd(inputValue);
  };

  const filteredSuggestions = POPULAR_TICKERS.filter(
    (t) =>
      !watchlist.some((w) => w.symbol === t.symbol) &&
      (t.symbol.toLowerCase().includes(inputValue.toLowerCase()) ||
        t.name.toLowerCase().includes(inputValue.toLowerCase()))
  ).slice(0, 6);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={handleOverlayClick}
    >
      <div className="w-full max-w-md neu-card p-6 animate-fadeIn max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-[var(--text-heading)]">マイ銘柄</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--text-body)] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Add Ticker Form */}
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setShowSuggestions(e.target.value.length > 0);
              }}
              onFocus={() => setShowSuggestions(inputValue.length > 0 || true)}
              placeholder="銘柄を追加（例: AAPL）"
              className="input-neu pr-12"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-xl bg-[var(--accent-blue)] text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          {/* Suggestions */}
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="mt-2 p-2 neu-inset rounded-xl">
              <p className="text-[10px] text-[var(--text-muted)] mb-2 px-2">人気銘柄</p>
              <div className="space-y-1">
                {filteredSuggestions.map((ticker) => (
                  <button
                    key={ticker.symbol}
                    type="button"
                    onClick={() => handleAdd(ticker.symbol)}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors text-left"
                  >
                    <div>
                      <span className="text-sm font-semibold text-[var(--accent-blue)]">${ticker.symbol}</span>
                      <span className="text-xs text-[var(--text-muted)] ml-2">{ticker.name}</span>
                    </div>
                    <svg className="w-4 h-4 text-[var(--text-light)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          )}
        </form>

        {/* Current Watchlist */}
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-heading)] mb-3">登録中の銘柄</h3>
          {watchlist.length === 0 ? (
            <div className="p-6 neu-inset rounded-xl text-center">
              <svg className="w-10 h-10 mx-auto text-[var(--text-light)] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              <p className="text-sm text-[var(--text-muted)]">銘柄が登録されていません</p>
              <p className="text-xs text-[var(--text-light)] mt-1">上の検索欄から追加してください</p>
            </div>
          ) : (
            <div className="space-y-2">
              {watchlist.map((ticker) => (
                <div
                  key={ticker.symbol}
                  className="flex items-center justify-between p-3 neu-flat rounded-xl"
                >
                  <div>
                    <span className="text-sm font-bold text-[var(--accent-blue)]">${ticker.symbol}</span>
                    <span className="text-xs text-[var(--text-muted)] ml-2">{ticker.name}</span>
                  </div>
                  <button
                    onClick={() => removeTicker(ticker.symbol)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
