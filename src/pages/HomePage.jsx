import { useEffect, useState, useCallback } from 'react';
import { useNews } from '../hooks/useNews';
import { useBookmarks } from '../hooks/useBookmarks';
import { useWatchlist } from '../hooks/useWatchlist';
import { analyzeNewsArticle, translateArticles, categorizeArticles, CATEGORIES } from '../services/geminiApi';
import { matchesWatchlist } from '../utils/newsFilters';
import FeaturedNewsCard from '../components/FeaturedNewsCard';
import NewsCard from '../components/NewsCard';
import ErrorBoundary from '../components/ErrorBoundary';
import { SkeletonList } from '../components/SkeletonCard';
import WatchlistModal from '../components/WatchlistModal';

export default function HomePage({ refreshTrigger, onRefreshingChange }) {
  const { articles, loading, error, loadNews, loadWatchlistNews } = useNews();
  const { toggleBookmark, isBookmarked } = useBookmarks();
  const { watchlist, addTicker, removeTicker } = useWatchlist();
  const [analyses, setAnalyses] = useState({});
  const [analyzingId, setAnalyzingId] = useState(null);
  const [translatedArticles, setTranslatedArticles] = useState([]);
  const [watchlistTranslatedArticles, setWatchlistTranslatedArticles] = useState([]);
  const [isTranslating, setIsTranslating] = useState(false);
  const [viewMode, setViewMode] = useState('timeline');
  const [isCategorizing, setIsCategorizing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('すべて');
  const [showWatchlistModal, setShowWatchlistModal] = useState(false);
  const [watchlistArticlesRaw, setWatchlistArticlesRaw] = useState([]);

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

  // Load watchlist news when switching to watchlist mode or when watchlist changes
  const loadWatchlistData = useCallback(async () => {
    if (watchlist.length === 0) {
      setWatchlistArticlesRaw([]);
      setWatchlistTranslatedArticles([]);
      return;
    }

    const results = await loadWatchlistNews(watchlist);
    setWatchlistArticlesRaw(results);

    // Translate watchlist articles
    if (results.length > 0) {
      setIsTranslating(true);
      try {
        const [translated, categorized] = await Promise.all([
          translateArticles(results),
          categorizeArticles(results),
        ]);

        const merged = (translated || []).map((article, index) => {
          let category = 'その他';
          if (categorized?.[index]?.category) {
            const cat = categorized[index].category;
            category = typeof cat === 'string' ? cat : 'その他';
          }
          return { ...article, category };
        });

        setWatchlistTranslatedArticles(merged);
      } catch (err) {
        console.error('Watchlist translation failed:', err);
        setWatchlistTranslatedArticles(results);
      } finally {
        setIsTranslating(false);
      }
    }
  }, [watchlist, loadWatchlistNews]);

  // Load watchlist news when viewMode changes to watchlist
  useEffect(() => {
    if (viewMode === 'watchlist') {
      loadWatchlistData();
    }
  }, [viewMode, loadWatchlistData]);

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

  // Use dedicated watchlist articles (from API) with fallback to filtered display articles
  const watchlistArticles = watchlist.length > 0
    ? (watchlistTranslatedArticles.length > 0
      ? watchlistTranslatedArticles
      : watchlistArticlesRaw.length > 0
        ? watchlistArticlesRaw
        : (displayArticles || []).filter(article => matchesWatchlist(article, watchlist, analyses))
    )
    : [];

  const featuredArticle = viewMode === 'timeline' ? filteredArticles?.[0] : null;
  const otherArticles = viewMode === 'timeline' ? (filteredArticles?.slice(1) || []) : (filteredArticles || []);

  // Determine if we should show skeleton
  const showSkeleton = (loading || isTranslating) && (!displayArticles || displayArticles.length === 0);

  return (
    <div className="flex-1 pt-8" style={{ paddingBottom: '180px' }}>
      {/* Main container with generous padding and breathing room */}
      <div className="main-container">


        {/* View Mode Toggle - Neumorphic Tab */}
        <div className="flex justify-center mb-12">
          <div className="tab-container flex w-auto">
            <button
              onClick={() => setViewMode('timeline')}
              className={`tab-item ${viewMode === 'timeline' ? 'active' : ''}`}
            >
              時系列
            </button>
            <button
              onClick={() => setViewMode('category')}
              className={`tab-item ${viewMode === 'category' ? 'active' : ''}`}
            >
              カテゴリ
            </button>
            <button
              onClick={() => setViewMode('watchlist')}
              className={`tab-item ${viewMode === 'watchlist' ? 'active' : ''}`}
            >
              マイ銘柄
            </button>
          </div>
        </div>

        {/* Category Tabs - ニュースライト風アイコン＋テキストメニュー */}
        {viewMode === 'category' && (
          <div className="mb-10 animate-fadeIn">
            <div className="category-scroll-container">
              <div className="category-icon-menu">
                {/* すべて */}
                <button
                  onClick={() => setSelectedCategory('すべて')}
                  className={`category-icon-item ${selectedCategory === 'すべて' ? 'active' : ''}`}
                >
                  <div className="category-icon-wrapper">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </div>
                  <span className="category-icon-label">すべて</span>
                  <span className="category-icon-count">{displayArticles?.length || 0}</span>
                </button>

                {/* 経済 */}
                {(categoryCounts['経済'] || 0) > 0 && (
                  <button
                    onClick={() => setSelectedCategory('経済')}
                    className={`category-icon-item ${selectedCategory === '経済' ? 'active' : ''}`}
                  >
                    <div className="category-icon-wrapper">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <span className="category-icon-label">経済</span>
                    <span className="category-icon-count">{categoryCounts['経済']}</span>
                  </button>
                )}

                {/* 国際情勢 */}
                {(categoryCounts['国際情勢'] || 0) > 0 && (
                  <button
                    onClick={() => setSelectedCategory('国際情勢')}
                    className={`category-icon-item ${selectedCategory === '国際情勢' ? 'active' : ''}`}
                  >
                    <div className="category-icon-wrapper">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="category-icon-label">国際情勢</span>
                    <span className="category-icon-count">{categoryCounts['国際情勢']}</span>
                  </button>
                )}

                {/* テクノロジー */}
                {(categoryCounts['テクノロジー'] || 0) > 0 && (
                  <button
                    onClick={() => setSelectedCategory('テクノロジー')}
                    className={`category-icon-item ${selectedCategory === 'テクノロジー' ? 'active' : ''}`}
                  >
                    <div className="category-icon-wrapper">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="category-icon-label">テクノロジー</span>
                    <span className="category-icon-count">{categoryCounts['テクノロジー']}</span>
                  </button>
                )}

                {/* 企業決算 */}
                {(categoryCounts['企業決算'] || 0) > 0 && (
                  <button
                    onClick={() => setSelectedCategory('企業決算')}
                    className={`category-icon-item ${selectedCategory === '企業決算' ? 'active' : ''}`}
                  >
                    <div className="category-icon-wrapper">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <span className="category-icon-label">企業決算</span>
                    <span className="category-icon-count">{categoryCounts['企業決算']}</span>
                  </button>
                )}

                {/* 金融政策 */}
                {(categoryCounts['金融政策'] || 0) > 0 && (
                  <button
                    onClick={() => setSelectedCategory('金融政策')}
                    className={`category-icon-item ${selectedCategory === '金融政策' ? 'active' : ''}`}
                  >
                    <div className="category-icon-wrapper">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                      </svg>
                    </div>
                    <span className="category-icon-label">金融政策</span>
                    <span className="category-icon-count">{categoryCounts['金融政策']}</span>
                  </button>
                )}

                {/* その他 */}
                {(categoryCounts['その他'] || 0) > 0 && (
                  <button
                    onClick={() => setSelectedCategory('その他')}
                    className={`category-icon-item ${selectedCategory === 'その他' ? 'active' : ''}`}
                  >
                    <div className="category-icon-wrapper">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                      </svg>
                    </div>
                    <span className="category-icon-label">その他</span>
                    <span className="category-icon-count">{categoryCounts['その他']}</span>
                  </button>
                )}
              </div>
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
                <div style={{ marginBottom: '48px' }}>
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

        {/* Watchlist Mode */}
        <ErrorBoundary>
          {viewMode === 'watchlist' && !showSkeleton && (
            <div className="space-y-8 animate-fadeIn">
              {/* Watchlist Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-heading)]">登録銘柄のニュース</h3>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    {watchlist.length > 0
                      ? `${watchlist.map(t => '$' + t.symbol).join(', ')} に関連するニュース`
                      : '銘柄を登録してください'}
                  </p>
                </div>
                <button
                  onClick={() => setShowWatchlistModal(true)}
                  className="btn-neu btn-neu-sm flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  銘柄管理
                </button>
              </div>

              {/* Watchlist Content */}
              {watchlist.length === 0 ? (
                <div className="p-12 neu-card text-center">
                  <svg className="w-16 h-16 mx-auto text-[var(--text-light)] mb-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  <p className="text-[var(--text-body)] font-medium mb-2">マイ銘柄を登録しましょう</p>
                  <p className="text-sm text-[var(--text-muted)] mb-6">気になる銘柄を登録すると、関連ニュースだけを表示できます</p>
                  <button
                    onClick={() => setShowWatchlistModal(true)}
                    className="btn-neu-primary"
                  >
                    銘柄を追加する
                  </button>
                </div>
              ) : watchlistArticles.length === 0 ? (
                <div className="p-12 neu-card text-center">
                  <svg className="w-12 h-12 mx-auto text-[var(--text-light)] mb-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                  <p className="text-[var(--text-muted)]">現在、登録銘柄に関連するニュースがありません</p>
                  <p className="text-xs text-[var(--text-light)] mt-2">後でもう一度確認してください</p>
                </div>
              ) : (
                <div className="card-list">
                  {watchlistArticles.map((article, index) => (
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

      {/* Watchlist Modal */}
      <WatchlistModal
        isOpen={showWatchlistModal}
        onClose={() => setShowWatchlistModal(false)}
        watchlist={watchlist}
        addTicker={addTicker}
        removeTicker={removeTicker}
      />
    </div>
  );
}
