import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'us-markets-watchlist';

// Popular US stock tickers for suggestions
export const POPULAR_TICKERS = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corporation' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation' },
  { symbol: 'TSLA', name: 'Tesla Inc.' },
  { symbol: 'META', name: 'Meta Platforms Inc.' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.' },
  { symbol: 'V', name: 'Visa Inc.' },
  { symbol: 'JNJ', name: 'Johnson & Johnson' },
  { symbol: 'WMT', name: 'Walmart Inc.' },
  { symbol: 'PG', name: 'Procter & Gamble Co.' },
  { symbol: 'MA', name: 'Mastercard Inc.' },
  { symbol: 'UNH', name: 'UnitedHealth Group' },
  { symbol: 'HD', name: 'The Home Depot Inc.' },
  { symbol: 'DIS', name: 'Walt Disney Co.' },
  { symbol: 'BAC', name: 'Bank of America Corp.' },
  { symbol: 'NFLX', name: 'Netflix Inc.' },
  { symbol: 'AMD', name: 'Advanced Micro Devices' },
  { symbol: 'INTC', name: 'Intel Corporation' },
];

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist));
  }, [watchlist]);

  const addTicker = useCallback((ticker) => {
    const upperTicker = ticker.toUpperCase().trim();
    if (!upperTicker) return false;

    setWatchlist((prev) => {
      if (prev.some((t) => t.symbol === upperTicker)) {
        return prev;
      }
      const tickerInfo = POPULAR_TICKERS.find((t) => t.symbol === upperTicker);
      return [...prev, { symbol: upperTicker, name: tickerInfo?.name || upperTicker }];
    });
    return true;
  }, []);

  const removeTicker = useCallback((ticker) => {
    setWatchlist((prev) => prev.filter((t) => t.symbol !== ticker));
  }, []);

  const isInWatchlist = useCallback(
    (ticker) => watchlist.some((t) => t.symbol === ticker),
    [watchlist]
  );

  const clearWatchlist = useCallback(() => {
    setWatchlist([]);
  }, []);

  return {
    watchlist,
    addTicker,
    removeTicker,
    isInWatchlist,
    clearWatchlist,
  };
}
