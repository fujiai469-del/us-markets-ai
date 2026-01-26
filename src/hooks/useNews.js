import { useState, useCallback } from 'react';
import { fetchTopBusinessNews, fetchUSStockNews, searchNews } from '../services/newsApi';

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

      // Combine and deduplicate by URL
      const combined = [...businessNews, ...stockNews];
      const unique = combined.filter(
        (article, index, self) =>
          index === self.findIndex((a) => a.url === article.url)
      );

      // Sort by date
      unique.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

      setArticles(unique.slice(0, 30));
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
      setArticles(results);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [loadNews]);

  return {
    articles,
    loading,
    error,
    loadNews,
    search,
  };
}
