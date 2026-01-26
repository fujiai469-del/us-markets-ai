import { useEffect, useState } from 'react';
import { useNews } from '../hooks/useNews';
import { useBookmarks } from '../hooks/useBookmarks';
import { analyzeNewsArticle } from '../services/geminiApi';
import FeaturedNewsCard from '../components/FeaturedNewsCard';
import NewsCard from '../components/NewsCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function HomePage() {
  const { articles, loading, error, loadNews } = useNews();
  const { toggleBookmark, isBookmarked } = useBookmarks();
  const [analyses, setAnalyses] = useState({});
  const [analyzingId, setAnalyzingId] = useState(null);

  useEffect(() => {
    loadNews();
  }, [loadNews]);

  const handleAnalyze = async (article) => {
    const articleId = article.url;
    if (analyses[articleId]) return;

    setAnalyzingId(articleId);
    try {
      const analysis = await analyzeNewsArticle(article);
      setAnalyses((prev) => ({ ...prev, [articleId]: analysis }));
    } catch (err) {
      console.error('Analysis failed:', err);
    } finally {
      setAnalyzingId(null);
    }
  };

  const featuredArticle = articles[0];
  const otherArticles = articles.slice(1);

  return (
    <div className="flex-1 pb-24">
      <div className="py-4">
        <div className="flex items-center justify-between px-4 mb-4">
          <h2 className="text-lg font-bold text-white">最新ニュース</h2>
          <button
            onClick={loadNews}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700/50 border border-slate-600/50 text-slate-300 text-sm hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            更新
          </button>
        </div>

        {loading && articles.length === 0 && <LoadingSpinner />}

        {error && (
          <div className="mx-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            エラー: {error}
          </div>
        )}

        {!loading && articles.length === 0 && !error && (
          <div className="mx-4 p-8 rounded-xl bg-slate-800/50 border border-slate-700/50 text-center">
            <p className="text-slate-400">ニュースが見つかりませんでした</p>
          </div>
        )}

        {featuredArticle && (
          <FeaturedNewsCard
            article={featuredArticle}
            onBookmark={toggleBookmark}
            isBookmarked={isBookmarked(featuredArticle.url)}
            onAnalyze={handleAnalyze}
            analysis={analyses[featuredArticle.url]}
            isAnalyzing={analyzingId === featuredArticle.url}
          />
        )}

        <div className="mt-2">
          {otherArticles.map((article) => (
            <NewsCard
              key={article.url}
              article={article}
              onBookmark={toggleBookmark}
              isBookmarked={isBookmarked(article.url)}
              onAnalyze={handleAnalyze}
              analysis={analyses[article.url]}
              isAnalyzing={analyzingId === article.url}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
