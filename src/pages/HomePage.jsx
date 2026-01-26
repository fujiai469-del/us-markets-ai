import { useEffect, useState } from 'react';
import { useNews } from '../hooks/useNews';
import { useBookmarks } from '../hooks/useBookmarks';
import { analyzeNewsArticle, translateArticles, categorizeArticles, CATEGORIES } from '../services/geminiApi';
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
  const [viewMode, setViewMode] = useState('timeline');
  const [isCategorizing, setIsCategorizing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('すべて');

  useEffect(() => {
    loadNews();
  }, [loadNews]);

  useEffect(() => {
    if (articles.length > 0 && translatedArticles.length === 0) {
      handleTranslateAndCategorize();
    }
  }, [articles]);

  const handleTranslateAndCategorize = async () => {
    if (articles.length === 0 || isTranslating) return;
    setIsTranslating(true);
    setIsCategorizing(true);
    try {
      const [translated, categorized] = await Promise.all([
        translateArticles(articles),
        categorizeArticles(articles),
      ]);

      const merged = translated.map((article, index) => ({
        ...article,
        category: categorized[index]?.category || 'その他',
      }));

      setTranslatedArticles(merged);
    } catch (err) {
      console.error('Processing failed:', err);
      setTranslatedArticles(articles);
    } finally {
      setIsTranslating(false);
      setIsCategorizing(false);
    }
  };

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setSelectedCategory('すべて');
    await loadNews();
    setTranslatedArticles([]);
    setIsRefreshing(false);
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

  // 更新中は既存の翻訳済み記事を表示し続ける
  const displayArticles = translatedArticles.length > 0
    ? translatedArticles
    : (isRefreshing ? [] : articles);

  const filteredArticles = viewMode === 'category' && selectedCategory !== 'すべて'
    ? displayArticles.filter(a => a.category === selectedCategory)
    : displayArticles;

  const groupedByCategory = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = displayArticles.filter(a => a.category === cat);
    return acc;
  }, {});

  const categoryCounts = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = displayArticles.filter(a => a.category === cat).length;
    return acc;
  }, {});

  const featuredArticle = viewMode === 'timeline' ? filteredArticles[0] : null;
  const otherArticles = viewMode === 'timeline' ? filteredArticles.slice(1) : filteredArticles;

  return (
    <div className="flex-1 pb-24">
      <div className="py-4">
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-4 mb-4">
          <h2 className="text-lg font-bold text-white">最新ニュース</h2>
          <button
            onClick={handleRefresh}
            disabled={loading || isTranslating}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm font-medium hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            <svg className={`w-4 h-4 ${loading || isTranslating ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {isTranslating ? '処理中' : '更新'}
          </button>
        </div>

        {/* 表示モード切り替え */}
        <div className="px-4 mb-4">
          <div className="flex gap-3">
            <button
              onClick={() => setViewMode('timeline')}
              className={`flex-1 py-3 px-6 rounded-xl text-sm font-medium transition-all ${
                viewMode === 'timeline'
                  ? 'bg-white text-slate-900'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              時系列
            </button>
            <button
              onClick={() => setViewMode('category')}
              className={`flex-1 py-3 px-6 rounded-xl text-sm font-medium transition-all ${
                viewMode === 'category'
                  ? 'bg-white text-slate-900'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              カテゴリー
            </button>
          </div>
        </div>

        {/* カテゴリータブ */}
        {viewMode === 'category' && (
          <div className="px-4 mb-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('すべて')}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  selectedCategory === 'すべて'
                    ? 'bg-white text-slate-900'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                すべて ({displayArticles.length})
              </button>
              {CATEGORIES.map(cat => (
                categoryCounts[cat] > 0 && (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      selectedCategory === cat
                        ? 'bg-white text-slate-900'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {cat} ({categoryCounts[cat]})
                  </button>
                )
              ))}
            </div>
          </div>
        )}

        {/* ローディング */}
        {(loading || isTranslating) && displayArticles.length === 0 && <LoadingSpinner />}

        {(loading || isTranslating) && displayArticles.length > 0 && (
          <div className="mx-4 mb-4 p-4 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-sm flex items-center gap-3">
            <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            {loading ? '最新ニュースを取得中...' : isCategorizing ? 'タイトル翻訳・カテゴリー分類中...' : 'タイトルを日本語に翻訳中...'}
          </div>
        )}

        {/* エラー */}
        {error && (
          <div className="mx-4 p-4 rounded-xl bg-red-900/30 border border-red-800 text-red-300 text-sm">
            エラー: {error}
          </div>
        )}

        {/* 記事なし */}
        {!loading && !isTranslating && displayArticles.length === 0 && !error && (
          <div className="mx-4 p-8 rounded-xl bg-slate-800 border border-slate-700 text-center">
            <p className="text-slate-400">ニュースが見つかりませんでした</p>
          </div>
        )}

        {/* 時系列モード */}
        {viewMode === 'timeline' && (
          <>
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
          </>
        )}

        {/* カテゴリーモード */}
        {viewMode === 'category' && (
          <div className="mt-2">
            {selectedCategory === 'すべて' ? (
              CATEGORIES.map(cat => (
                groupedByCategory[cat]?.length > 0 && (
                  <div key={cat} className="mb-6">
                    <div className="px-4 mb-3 flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">{cat}</h3>
                      <span className="text-sm text-slate-500">({groupedByCategory[cat].length}件)</span>
                    </div>
                    {groupedByCategory[cat].map((article) => (
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
                )
              ))
            ) : (
              filteredArticles.map((article) => (
                <NewsCard
                  key={article.url}
                  article={article}
                  onBookmark={toggleBookmark}
                  isBookmarked={isBookmarked(article.url)}
                  onAnalyze={handleAnalyze}
                  analysis={analyses[article.url]}
                  isAnalyzing={analyzingId === article.url}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
