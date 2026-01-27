import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNews } from '../hooks/useNews';
import { useBookmarks } from '../hooks/useBookmarks';
import { analyzeNewsArticle, translateArticles, categorizeArticles, CATEGORIES } from '../services/geminiApi';
import FeaturedNewsCard from '../components/FeaturedNewsCard';
import NewsCard from '../components/NewsCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorBoundary from '../components/ErrorBoundary';
import { SkeletonList, SkeletonCard } from '../components/SkeletonCard';

// Safe wrapper for article card rendering
function SafeNewsCard(props) {
  try {
    if (!props?.article) return null;
    return <NewsCard {...props} />;
  } catch (error) {
    console.error('NewsCard render error:', error);
    return null;
  }
}

function SafeFeaturedNewsCard(props) {
  try {
    if (!props?.article) return null;
    return <FeaturedNewsCard {...props} />;
  } catch (error) {
    console.error('FeaturedNewsCard render error:', error);
    return null;
  }
}

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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    loadNews();
  }, [loadNews]);

  useEffect(() => {
    if (articles?.length > 0 && translatedArticles?.length === 0) {
      handleTranslateAndCategorize();
    }
  }, [articles]);

  const handleTranslateAndCategorize = async () => {
    if (!articles?.length || isTranslating) return;
    setIsTranslating(true);
    setIsCategorizing(true);
    setIsUpdating(true);
    try {
      const [translated, categorized] = await Promise.all([
        translateArticles(articles),
        categorizeArticles(articles),
      ]);

      const merged = (translated || []).map((article, index) => ({
        ...article,
        category: categorized?.[index]?.category || 'その他',
      }));

      setTranslatedArticles(merged);
    } catch (err) {
      console.error('Processing failed:', err);
      // Fallback to original articles on error
      setTranslatedArticles(articles || []);
    } finally {
      setIsTranslating(false);
      setIsCategorizing(false);
      setIsUpdating(false);
    }
  };

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setIsUpdating(true);
    setSelectedCategory('すべて');
    try {
      await loadNews();
      setTranslatedArticles([]);
    } catch (err) {
      console.error('Refresh failed:', err);
    } finally {
      setIsRefreshing(false);
      // isUpdating will be set to false when translation completes
    }
  }, [loadNews]);

  const handleAnalyze = useCallback(async (article) => {
    if (!article?.url) return;
    const articleId = article.url;
    if (analyses[articleId]) return;

    setAnalyzingId(articleId);
    try {
      const analysis = await analyzeNewsArticle(article);
      if (analysis) {
        setAnalyses((prev) => ({ ...prev, [articleId]: analysis }));
      }
    } catch (err) {
      console.error('Analysis failed:', err);
    } finally {
      setAnalyzingId(null);
    }
  }, [analyses]);

  // Safe display articles with fallback
  const displayArticles = useMemo(() => {
    if (translatedArticles?.length > 0) {
      return translatedArticles;
    }
    if (isRefreshing || isUpdating) {
      return [];
    }
    return articles || [];
  }, [translatedArticles, isRefreshing, isUpdating, articles]);

  const filteredArticles = useMemo(() => {
    if (!displayArticles?.length) return [];
    if (viewMode === 'category' && selectedCategory !== 'すべて') {
      return displayArticles.filter(a => a?.category === selectedCategory);
    }
    return displayArticles;
  }, [displayArticles, viewMode, selectedCategory]);

  const groupedByCategory = useMemo(() => {
    if (!CATEGORIES || !displayArticles?.length) return {};
    return CATEGORIES.reduce((acc, cat) => {
      acc[cat] = displayArticles.filter(a => a?.category === cat);
      return acc;
    }, {});
  }, [displayArticles]);

  const categoryCounts = useMemo(() => {
    if (!CATEGORIES || !displayArticles?.length) return {};
    return CATEGORIES.reduce((acc, cat) => {
      acc[cat] = displayArticles.filter(a => a?.category === cat).length;
      return acc;
    }, {});
  }, [displayArticles]);

  const featuredArticle = viewMode === 'timeline' && filteredArticles?.length > 0 ? filteredArticles[0] : null;
  const otherArticles = viewMode === 'timeline' && filteredArticles?.length > 1 ? filteredArticles.slice(1) : (viewMode === 'timeline' ? [] : filteredArticles);

  // Show skeleton during initial load or refresh
  const showSkeleton = (loading || isTranslating || isUpdating) && displayArticles?.length === 0;

  return (
    <div className="flex-1 pb-24 bg-[#141414]">
      <div className="py-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-5 mb-6">
          <div>
            <h2 className="text-xl font-bold text-[#E6E3DC] tracking-wide" style={{fontFamily: 'Georgia, serif'}}>Latest News</h2>
            <p className="text-xs text-[#6B7280] mt-1 tracking-wider">最新ニュース</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading || isTranslating || isUpdating}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1F242B] border border-[#2A2A2A] text-[#B59A5A] text-sm font-medium hover:border-[#B59A5A]/30 transition-all duration-300 disabled:opacity-50"
          >
            <svg className={`w-4 h-4 ${loading || isTranslating || isUpdating ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {isTranslating || isUpdating ? '処理中' : '更新'}
          </button>
        </div>

        {/* 表示モード切り替え */}
        <div className="px-5 mb-6">
          <div className="flex gap-3 p-1.5 bg-[#1C1B1A] rounded-xl border border-[#2A2A2A]">
            <button
              onClick={() => setViewMode('timeline')}
              className={`flex-1 py-3 px-6 rounded-lg text-sm font-medium transition-all duration-300 ${
                viewMode === 'timeline'
                  ? 'bg-gradient-to-r from-[#B59A5A] to-[#9C8450] text-[#141414]'
                  : 'text-[#9FA3A9] hover:text-[#E6E3DC]'
              }`}
            >
              時系列
            </button>
            <button
              onClick={() => setViewMode('category')}
              className={`flex-1 py-3 px-6 rounded-lg text-sm font-medium transition-all duration-300 ${
                viewMode === 'category'
                  ? 'bg-gradient-to-r from-[#B59A5A] to-[#9C8450] text-[#141414]'
                  : 'text-[#9FA3A9] hover:text-[#E6E3DC]'
              }`}
            >
              カテゴリー
            </button>
          </div>
        </div>

        {/* カテゴリータブ */}
        {viewMode === 'category' && (
          <div className="px-5 mb-6">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('すべて')}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 border ${
                  selectedCategory === 'すべて'
                    ? 'bg-[#B59A5A]/20 border-[#B59A5A]/50 text-[#B59A5A]'
                    : 'bg-[#1F242B] border-[#2A2A2A] text-[#9FA3A9] hover:border-[#B59A5A]/30 hover:text-[#E6E3DC]'
                }`}
              >
                すべて ({displayArticles?.length || 0})
              </button>
              {CATEGORIES?.map(cat => (
                (categoryCounts?.[cat] || 0) > 0 && (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 border ${
                      selectedCategory === cat
                        ? 'bg-[#B59A5A]/20 border-[#B59A5A]/50 text-[#B59A5A]'
                        : 'bg-[#1F242B] border-[#2A2A2A] text-[#9FA3A9] hover:border-[#B59A5A]/30 hover:text-[#E6E3DC]'
                    }`}
                  >
                    {cat} ({categoryCounts[cat]})
                  </button>
                )
              ))}
            </div>
          </div>
        )}

        {/* スケルトンローダー（初回ロード・リフレッシュ時） */}
        {showSkeleton && (
          <SkeletonList count={4} showFeatured={viewMode === 'timeline'} />
        )}

        {/* 更新中バナー（既存記事表示中） */}
        {(loading || isTranslating || isUpdating) && displayArticles?.length > 0 && (
          <div className="mx-5 mb-5 p-4 rounded-xl bg-[#1F242B] border border-[#B59A5A]/20 text-[#9FA3A9] text-sm flex items-center gap-3">
            <svg className="w-5 h-5 text-[#B59A5A] animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            {loading ? '最新ニュースを取得中...' : isCategorizing ? 'タイトル翻訳・カテゴリー分類中...' : 'タイトルを日本語に翻訳中...'}
          </div>
        )}

        {/* エラー */}
        {error && (
          <div className="mx-5 mb-5 p-4 rounded-xl bg-[#A65D57]/10 border border-[#A65D57]/30 text-[#D4847E] text-sm">
            エラー: {error}
          </div>
        )}

        {/* 記事なし */}
        {!loading && !isTranslating && !isUpdating && displayArticles?.length === 0 && !error && (
          <div className="mx-5 p-8 rounded-xl bg-[#1F242B] border border-[#2A2A2A] text-center">
            <p className="text-[#6B7280]">ニュースが見つかりませんでした</p>
          </div>
        )}

        {/* 時系列モード */}
        {!showSkeleton && viewMode === 'timeline' && (
          <ErrorBoundary>
            <>
              {featuredArticle && (
                <SafeFeaturedNewsCard
                  article={featuredArticle}
                  onBookmark={toggleBookmark}
                  isBookmarked={isBookmarked(featuredArticle?.url)}
                  onAnalyze={handleAnalyze}
                  analysis={analyses?.[featuredArticle?.url]}
                  isAnalyzing={analyzingId === featuredArticle?.url}
                />
              )}

              <div className="mt-3">
                {otherArticles?.map((article) => (
                  article?.url && (
                    <SafeNewsCard
                      key={article.url}
                      article={article}
                      onBookmark={toggleBookmark}
                      isBookmarked={isBookmarked(article?.url)}
                      onAnalyze={handleAnalyze}
                      analysis={analyses?.[article?.url]}
                      isAnalyzing={analyzingId === article?.url}
                    />
                  )
                ))}
              </div>
            </>
          </ErrorBoundary>
        )}

        {/* カテゴリーモード */}
        {!showSkeleton && viewMode === 'category' && (
          <ErrorBoundary>
            <div className="mt-3">
              {selectedCategory === 'すべて' ? (
                CATEGORIES?.map(cat => (
                  groupedByCategory?.[cat]?.length > 0 && (
                    <div key={cat} className="mb-8">
                      <div className="px-5 mb-4 flex items-center gap-2">
                        <h3 className="text-base font-bold text-[#E6E3DC]" style={{fontFamily: 'Georgia, serif'}}>{cat}</h3>
                        <span className="text-sm text-[#6B7280]">({groupedByCategory[cat]?.length || 0}件)</span>
                      </div>
                      {groupedByCategory[cat]?.map((article) => (
                        article?.url && (
                          <SafeNewsCard
                            key={article.url}
                            article={article}
                            onBookmark={toggleBookmark}
                            isBookmarked={isBookmarked(article?.url)}
                            onAnalyze={handleAnalyze}
                            analysis={analyses?.[article?.url]}
                            isAnalyzing={analyzingId === article?.url}
                          />
                        )
                      ))}
                    </div>
                  )
                ))
              ) : (
                filteredArticles?.map((article) => (
                  article?.url && (
                    <SafeNewsCard
                      key={article.url}
                      article={article}
                      onBookmark={toggleBookmark}
                      isBookmarked={isBookmarked(article?.url)}
                      onAnalyze={handleAnalyze}
                      analysis={analyses?.[article?.url]}
                      isAnalyzing={analyzingId === article?.url}
                    />
                  )
                ))
              )}
            </div>
          </ErrorBoundary>
        )}
      </div>
    </div>
  );
}
