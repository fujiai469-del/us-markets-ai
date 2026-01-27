import { useEffect, useState } from 'react';
import { useNews } from '../hooks/useNews';
import { useBookmarks } from '../hooks/useBookmarks';
import { analyzeNewsArticle, translateArticles, categorizeArticles, CATEGORIES } from '../services/geminiApi';
import FeaturedNewsCard from '../components/FeaturedNewsCard';
import NewsCard from '../components/NewsCard';
import ErrorBoundary from '../components/ErrorBoundary';
import { SkeletonList } from '../components/SkeletonCard';

export default function HomePage({ refreshTrigger, onRefreshingChange }) {
  const { articles, loading, error, loadNews } = useNews();
  const { toggleBookmark, isBookmarked } = useBookmarks();
  const [analyses, setAnalyses] = useState({});
  const [analyzingId, setAnalyzingId] = useState(null);
  const [translatedArticles, setTranslatedArticles] = useState([]);
  const [isTranslating, setIsTranslating] = useState(false);
  const [viewMode, setViewMode] = useState('timeline');
  const [isCategorizing, setIsCategorizing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('すべて');

  const handleTranslateAndCategorize = async () => {
    if (!articles?.length || isTranslating) return;
    setIsTranslating(true);
    setIsCategorizing(true);
    try {
      const [translated, categorized] = await Promise.all([
        translateArticles(articles),
        categorizeArticles(articles),
      ]);

      // Safely merge translated and categorized articles
      const merged = (translated || []).map((article, index) => {
        // Ensure category is always a string
        let category = 'その他';
        if (categorized?.[index]?.category) {
          const cat = categorized[index].category;
          category = typeof cat === 'string' ? cat : 'その他';
        }
        return {
          ...article,
          category,
        };
      });

      setTranslatedArticles(merged);
    } catch (err) {
      console.error('Processing failed:', err);
      setTranslatedArticles(articles || []);
    } finally {
      setIsTranslating(false);
      setIsCategorizing(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadNews();
  }, [loadNews]);

  // Handle refresh trigger from header
  useEffect(() => {
    if (refreshTrigger > 0) {
      const doRefresh = async () => {
        if (onRefreshingChange) onRefreshingChange(true);
        setSelectedCategory('すべて');
        await loadNews();
        setTranslatedArticles([]);
        if (onRefreshingChange) onRefreshingChange(false);
      };
      doRefresh();
    }
  }, [refreshTrigger, loadNews, onRefreshingChange]);

  useEffect(() => {
    if (articles?.length > 0 && translatedArticles?.length === 0) {
      handleTranslateAndCategorize();
    }
  }, [articles]);

  const handleAnalyze = async (article) => {
    if (!article?.url) return;
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

  // Safe access to articles with fallbacks
  const displayArticles = translatedArticles?.length > 0
    ? translatedArticles
    : (articles || []);

  const filteredArticles = viewMode === 'category' && selectedCategory !== 'すべて'
    ? (displayArticles || []).filter(a => a?.category === selectedCategory)
    : (displayArticles || []);

  const groupedByCategory = (CATEGORIES || []).reduce((acc, cat) => {
    acc[cat] = (displayArticles || []).filter(a => a?.category === cat);
    return acc;
  }, {});

  const categoryCounts = (CATEGORIES || []).reduce((acc, cat) => {
    acc[cat] = (displayArticles || []).filter(a => a?.category === cat).length;
    return acc;
  }, {});

  const featuredArticle = viewMode === 'timeline' ? filteredArticles?.[0] : null;
  const otherArticles = viewMode === 'timeline' ? (filteredArticles?.slice(1) || []) : (filteredArticles || []);

  // Determine if we should show skeleton
  const showSkeleton = (loading || isTranslating) && (!displayArticles || displayArticles.length === 0);

  return (
    <div className="flex-1 pt-8" style={{ paddingBottom: '180px' }}>
      {/* Main container with generous padding and breathing room */}
      <div className="main-container">
        {/* Section Header */}
        <div className="mb-12 pt-4">
          <h2 className="text-xl font-bold text-[var(--text-heading)]">
            本日のニュース
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-1.5">
            最新のマーケット情報
          </p>
        </div>

        {/* View Mode Toggle - Neumorphic Tab */}
        <div className="flex justify-center mb-12">
          <div className="tab-container flex w-auto">
            <button
              onClick={() => setViewMode('timeline')}
              className={`tab-item ${viewMode === 'timeline' ? 'active' : ''}`}
            >
              タイムライン
            </button>
            <button
              onClick={() => setViewMode('category')}
              className={`tab-item ${viewMode === 'category' ? 'active' : ''}`}
            >
              カテゴリー
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        {viewMode === 'category' && (
          <div className="mb-10 animate-fadeIn">
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setSelectedCategory('すべて')}
                className={`chip-neu ${selectedCategory === 'すべて' ? 'active' : ''}`}
              >
                すべて ({displayArticles?.length || 0})
              </button>
              {(CATEGORIES || []).map(cat => (
                (categoryCounts[cat] || 0) > 0 && (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`chip-neu ${selectedCategory === cat ? 'active' : ''}`}
                  >
                    {cat} ({categoryCounts[cat] || 0})
                  </button>
                )
              ))}
            </div>
          </div>
        )}

        {/* Skeleton Loading */}
        {showSkeleton && <SkeletonList count={4} showFeatured={viewMode === 'timeline'} />}

        {/* Updating indicator (when articles exist but updating) */}
        {(loading || isTranslating) && displayArticles?.length > 0 && (
          <div className="mb-8 p-5 neu-flat flex items-center gap-4">
            <div className="w-5 h-5 spinner-neu animate-spin flex-shrink-0" />
            <span className="text-sm text-[var(--text-muted)]">
              {loading ? '最新ニュースを取得中...' : isCategorizing ? '翻訳・カテゴリ分類中...' : '翻訳中...'}
            </span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm mb-6">
            エラー: {error}
          </div>
        )}

        {/* No Articles */}
        {!loading && !isTranslating && (!displayArticles || displayArticles.length === 0) && !error && (
          <div className="p-12 neu-card text-center">
            <svg className="w-12 h-12 mx-auto text-[var(--text-light)] mb-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            <p className="text-[var(--text-muted)]">記事が見つかりませんでした</p>
          </div>
        )}

        {/* Timeline Mode */}
        <ErrorBoundary>
          {viewMode === 'timeline' && !showSkeleton && (
            <div className="space-y-10">
              {featuredArticle && (
                <div className="mb-8">
                  <FeaturedNewsCard
                    article={featuredArticle}
                    onBookmark={toggleBookmark}
                    isBookmarked={isBookmarked(featuredArticle?.url)}
                    onAnalyze={handleAnalyze}
                    analysis={analyses[featuredArticle?.url]}
                    isAnalyzing={analyzingId === featuredArticle?.url}
                  />
                </div>
              )}

              <div className="card-list">
                {(otherArticles || []).map((article, index) => (
                  article?.url ? (
                    <div key={article.url} className="animate-fadeIn" style={{ animationDelay: `${index * 50}ms` }}>
                      <NewsCard
                        article={article}
                        onBookmark={toggleBookmark}
                        isBookmarked={isBookmarked(article?.url)}
                        onAnalyze={handleAnalyze}
                        analysis={analyses[article?.url]}
                        isAnalyzing={analyzingId === article?.url}
                      />
                    </div>
                  ) : null
                ))}
              </div>
            </div>
          )}
        </ErrorBoundary>

        {/* Category Mode */}
        <ErrorBoundary>
          {viewMode === 'category' && !showSkeleton && (
            <div className="space-y-12">
              {selectedCategory === 'すべて' ? (
                (CATEGORIES || []).map(cat => (
                  (groupedByCategory[cat]?.length || 0) > 0 && (
                    <div key={cat} className="animate-fadeIn">
                      <div className="mb-6 flex items-center gap-3">
                        <h3 className="text-sm font-bold text-[var(--text-heading)]">{cat}</h3>
                        <div className="flex-1 h-px bg-gradient-to-r from-[var(--shadow-dark)] to-transparent" />
                        <span className="text-xs text-[var(--text-muted)]">({groupedByCategory[cat]?.length || 0}件)</span>
                      </div>
                      <div className="card-list">
                        {(groupedByCategory[cat] || []).map((article, index) => (
                          article?.url ? (
                            <div key={article.url} style={{ animationDelay: `${index * 50}ms` }}>
                              <NewsCard
                                article={article}
                                onBookmark={toggleBookmark}
                                isBookmarked={isBookmarked(article?.url)}
                                onAnalyze={handleAnalyze}
                                analysis={analyses[article?.url]}
                                isAnalyzing={analyzingId === article?.url}
                              />
                            </div>
                          ) : null
                        ))}
                      </div>
                    </div>
                  )
                ))
              ) : (
                <div className="card-list">
                  {(filteredArticles || []).map((article, index) => (
                    article?.url ? (
                      <div key={article.url} className="animate-fadeIn" style={{ animationDelay: `${index * 50}ms` }}>
                        <NewsCard
                          article={article}
                          onBookmark={toggleBookmark}
                          isBookmarked={isBookmarked(article?.url)}
                          onAnalyze={handleAnalyze}
                          analysis={analyses[article?.url]}
                          isAnalyzing={analyzingId === article?.url}
                        />
                      </div>
                    ) : null
                  ))}
                </div>
              )}
            </div>
          )}
        </ErrorBoundary>
      </div>
    </div>
  );
}
