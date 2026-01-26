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
  const [isRefreshing, setIsRefreshing] = useState(false);

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
    <div className="flex-1 pb-24 bg-[#141414]">
      <div className="py-5">
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-5 mb-5">
          <div>
            <h2 className="text-xl font-bold text-[#E6E3DC] tracking-wide" style={{fontFamily: 'Georgia, serif'}}>Latest News</h2>
            <p className="text-xs text-[#6B7280] mt-0.5 tracking-wider">最新ニュース</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading || isTranslating}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1F242B] border border-[#2A2A2A] text-[#B59A5A] text-sm font-medium hover:border-[#B59A5A]/30 transition-all duration-300 disabled:opacity-50"
          >
            <svg className={`w-4 h-4 ${loading || isTranslating ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {isTranslating ? '処理中' : '更新'}
          </button>
        </div>

        {/* 表示モード切り替え */}
        <div className="px-5 mb-5">
          <div className="flex gap-3 p-1 bg-[#1C1B1A] rounded-xl border border-[#2A2A2A]">
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
          <div className="px-5 mb-5">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('すべて')}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 border ${
                  selectedCategory === 'すべて'
                    ? 'bg-[#B59A5A]/20 border-[#B59A5A]/50 text-[#B59A5A]'
                    : 'bg-[#1F242B] border-[#2A2A2A] text-[#9FA3A9] hover:border-[#B59A5A]/30 hover:text-[#E6E3DC]'
                }`}
              >
                すべて ({displayArticles.length})
              </button>
              {CATEGORIES.map(cat => (
                categoryCounts[cat] > 0 && (
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

        {/* ローディング */}
        {(loading || isTranslating) && displayArticles.length === 0 && <LoadingSpinner />}

        {(loading || isTranslating) && displayArticles.length > 0 && (
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
          <div className="mx-5 p-4 rounded-xl bg-[#A65D57]/10 border border-[#A65D57]/30 text-[#D4847E] text-sm">
            エラー: {error}
          </div>
        )}

        {/* 記事なし */}
        {!loading && !isTranslating && displayArticles.length === 0 && !error && (
          <div className="mx-5 p-8 rounded-xl bg-[#1F242B] border border-[#2A2A2A] text-center">
            <p className="text-[#6B7280]">ニュースが見つかりませんでした</p>
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
                    <div className="px-5 mb-3 flex items-center gap-2">
                      <h3 className="text-base font-bold text-[#E6E3DC]" style={{fontFamily: 'Georgia, serif'}}>{cat}</h3>
                      <span className="text-sm text-[#6B7280]">({groupedByCategory[cat].length}件)</span>
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
