import { useEffect, useState } from 'react';
import { useNews } from '../hooks/useNews';
import { useBookmarks } from '../hooks/useBookmarks';
import { analyzeNewsArticle, translateArticles } from '../services/geminiApi';
import FeaturedNewsCard from '../components/FeaturedNewsCard';
import NewsCard from '../components/NewsCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function HomePage() {
  const { articles, loading, error, loadNews } = useNews();
  const { toggleBookmark, isBookmarked } = useBookmarks();
  const [analyses, setAnalyses] = useState({});
  const [analyzingId, setAnalyzingId] = useState(null);
  const [translatedArticles, setTranslatedArticles] = useState([]);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    loadNews();
  }, [loadNews]);

  // 記事が読み込まれたら自動で翻訳
  useEffect(() => {
    if (articles.length > 0 && translatedArticles.length === 0) {
      handleTranslate();
    }
  }, [articles]);

  const handleTranslate = async () => {
    if (articles.length === 0 || isTranslating) return;
    setIsTranslating(true);
    try {
      const translated = await translateArticles(articles);
      setTranslatedArticles(translated);
    } catch (err) {
      console.error('Translation failed:', err);
      setTranslatedArticles(articles);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleRefresh = async () => {
    setTranslatedArticles([]);
    await loadNews();
  };

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

  const displayArticles = translatedArticles.length > 0 ? translatedArticles : articles;
  const featuredArticle = displayArticles[0];
  const otherArticles = displayArticles.slice(1);

  return (
    <div className="flex-1 pb-24">
      <div className="py-4">
        <div className="flex items-center justify-between px-4 mb-4">
          <h2 className="text-lg font-bold text-white">最新ニュース</h2>
          <button
            onClick={handleRefresh}
            disabled={loading || isTranslating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700/50 border border-slate-600/50 text-slate-300 text-sm hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            <svg className={`w-4 h-4 ${loading || isTranslating ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {isTranslating ? '翻訳中' : '更新'}
          </button>
        </div>

        {(loading || isTranslating) && articles.length === 0 && <LoadingSpinner />}

        {isTranslating && articles.length > 0 && (
          <div className="mx-4 mb-4 p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm flex items-center gap-2">
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            タイトルを日本語に翻訳中...
          </div>
        )}

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
