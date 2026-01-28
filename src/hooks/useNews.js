import { useState, useCallback } from 'react';
import { fetchTopBusinessNews, fetchUSStockNews, searchNews, fetchWatchlistNews } from '../services/newsApi';
import { filterAndScoreArticles, matchesWatchlist } from '../utils/newsFilters';

export function useNews() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadNews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [businessNews, stockNews] = await Promise.all([
        fetchTopBusinessNews(),
        fetchUSStockNews(),
      ]);

      // Combine articles
      const combined = [...businessNews, ...stockNews];

      // Apply comprehensive filtering: deduplication, source quality, region filtering
      const filtered = filterAndScoreArticles(combined, {
        removeBlacklisted: true,
        prioritizeTrusted: true,
        filterNonUS: true,
        deduplicate: true,
        dedupeThreshold: 0.6,
      });

      setArticles(filtered.slice(0, 35));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const search = useCallback(async (query) => {
    if (!query.trim()) {
      return loadNews();
    }

    setLoading(true);
    setError(null);
    try {
      const results = await searchNews(query);
      // Apply filtering to search results as well
      const filtered = filterAndScoreArticles(results, {
        removeBlacklisted: true,
        prioritizeTrusted: true,
        filterNonUS: false, // Don't filter non-US for search (user might want global results)
        deduplicate: true,
        dedupeThreshold: 0.6,
      });
      setArticles(filtered);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [loadNews]);

  // Load news specifically for watchlist tickers
  const loadWatchlistNews = useCallback(async (watchlist) => {
    if (!watchlist || watchlist.length === 0) {
      setArticles([]);
      return [];
    }

    setLoading(true);
    setError(null);
    try {
      const results = await fetchWatchlistNews(watchlist);
      // Apply filtering
      const filtered = filterAndScoreArticles(results, {
        removeBlacklisted: true,
        prioritizeTrusted: true,
        filterNonUS: true,
        deduplicate: true,
        dedupeThreshold: 0.5, // Slightly stricter for watchlist
      });

      // Double-check that articles actually match the watchlist
      const matched = filtered.filter(article =>
        matchesWatchlist(article, watchlist)
      );

      setArticles(matched.length > 0 ? matched : filtered.slice(0, 20));
      return matched.length > 0 ? matched : filtered.slice(0, 20);
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    articles,
    loading,
    error,
    loadNews,
    search,
    loadWatchlistNews,
  };
}
