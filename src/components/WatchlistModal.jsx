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
  ).slice(0, 5);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={handleOverlayClick}
    >
      <div className="w-[95%] sm:w-full max-w-md neu-card p-6 sm:p-10 animate-fadeIn max-h-[90vh] sm:max-h-[85vh] overflow-y-auto">
        {/* Header - More spacing */}
        <div className="flex items-center justify-between mb-8 sm:mb-10">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[var(--text-heading)]">マイ銘柄</h2>
            <p className="text-[11px] sm:text-xs text-[var(--text-muted)] mt-2">ウォッチリストを管理</p>
          </div>
          <button
            onClick={onClose}
            className="w-11 h-11 sm:w-11 sm:h-11 flex items-center justify-center rounded-xl neu-raised-sm text-[var(--text-muted)] hover:text-[var(--text-body)] transition-colors touch-target"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Add Ticker Form - Increased height and spacing */}
        <form onSubmit={handleSubmit} className="mb-8 sm:mb-10">
          <label className="block text-sm font-medium text-[var(--text-body)] mb-4">
            銘柄を追加
          </label>
          <div className="relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setShowSuggestions(e.target.value.length > 0);
              }}
              onFocus={() => setShowSuggestions(inputValue.length > 0 || true)}
              placeholder="ティッカーを入力（例: AAPL）"
              className="input-neu w-full py-4 sm:py-5 px-4 sm:px-5 pr-16 text-base min-h-[52px]"
              style={{ fontSize: '16px' }} /* Prevents iOS zoom */
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl bg-[var(--accent-blue)] text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:bg-[var(--accent-blue-dark)] touch-target"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          {/* Suggestions - More padding and spacing */}
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="mt-4 sm:mt-5 p-4 sm:p-5 neu-inset rounded-2xl">
              <p className="text-xs font-medium text-[var(--text-muted)] mb-4 uppercase tracking-wide">人気銘柄</p>
              <div className="space-y-3 sm:space-y-2">
                {filteredSuggestions.map((ticker) => (
                  <button
                    key={ticker.symbol}
                    type="button"
                    onClick={() => handleAdd(ticker.symbol)}
                    className="w-full flex items-center justify-between p-4 sm:p-4 rounded-xl hover:bg-[var(--bg-secondary)] transition-colors text-left min-h-[48px]"
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      <span className="text-sm sm:text-base font-bold text-[var(--accent-blue)]">${ticker.symbol}</span>
                      <span className="text-[13px] sm:text-sm text-[var(--text-muted)]">{ticker.name}</span>
                    </div>
                    <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-[var(--accent-blue)]/10">
                      <svg className="w-4 h-4 text-[var(--accent-blue)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </form>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-[var(--shadow-dark)]/30 to-transparent mb-8 sm:mb-10" />

        {/* Current Watchlist - More spacing */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-[var(--text-heading)] uppercase tracking-wide">登録中の銘柄</h3>
            {watchlist.length > 0 && (
              <span className="text-xs text-[var(--text-muted)]">{watchlist.length}件</span>
            )}
          </div>

          {watchlist.length === 0 ? (
            <div className="p-8 sm:p-10 neu-inset rounded-2xl text-center">
              <svg className="w-12 h-12 sm:w-14 sm:h-14 mx-auto text-[var(--text-light)] mb-4 sm:mb-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              <p className="text-base text-[var(--text-muted)] mb-2">銘柄が登録されていません</p>
              <p className="text-sm text-[var(--text-light)]">上の検索欄から追加してください</p>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-4">
              {watchlist.map((ticker) => (
                <div
                  key={ticker.symbol}
                  className="flex items-center justify-between p-4 sm:p-5 neu-flat rounded-2xl"
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl bg-[var(--accent-blue)]/10">
                      <span className="text-sm font-bold text-[var(--accent-blue)]">{ticker.symbol.slice(0, 2)}</span>
                    </div>
                    <div>
                      <span className="text-sm sm:text-base font-bold text-[var(--text-heading)]">${ticker.symbol}</span>
                      <p className="text-[13px] sm:text-sm text-[var(--text-muted)] mt-0.5 sm:mt-1">{ticker.name}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeTicker(ticker.symbol)}
                    className="w-11 h-11 flex items-center justify-center rounded-xl text-red-400 hover:text-red-500 hover:bg-red-50 transition-colors touch-target"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
