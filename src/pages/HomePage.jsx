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
  const [viewMode, setViewMode] = useState('timeline'); // 'timeline' or 'category'
  const [isCategorizing, setIsCategorizing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('すべて');

  useEffect(() => {
    loadNews();
  }, [loadNews]);

  // 記事が読み込まれたら自動で翻訳
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
      // 翻訳とカテゴリー分類を並行実行
      const [translated, categorized] = await Promise.all([
        translateArticles(articles),
        categorizeArticles(articles),
      ]);

      // 両方の結果をマージ
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
    setTranslatedArticles([]);
    setSelectedCategory('すべて');
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

  // カテゴリーでフィルタリング
  const filteredArticles = viewMode === 'category' && selectedCategory !== 'すべて'
    ? displayArticles.filter(a => a.category === selectedCategory)
    : displayArticles;

  // カテゴリー別に記事をグループ化
  const groupedByCategory = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = displayArticles.filter(a => a.category === cat);
    return acc;
  }, {});

  // 各カテゴリーの記事数を取得
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
        <div className="flex items-center justify-between px-4 mb-3">
          <h2 className="text-lg font-bold text-white">最新ニュース</h2>
          <button
            onClick={handleRefresh}
            disabled={loading || isTranslating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700/50 border border-slate-600/50 text-slate-300 text-sm hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            <svg className={`w-4 h-4 ${loading || isTranslating ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {isTranslating ? '処理中' : '更新'}
          </button>
        </div>

        {/* 表示モード切り替え */}
        <div className="px-4 mb-4">
          <div className="flex bg-slate-800/60 rounded-xl p-1 border border-slate-700/50">
            <button
              onClick={() => setViewMode('timeline')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                viewMode === 'timeline'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              時系列
            </button>
            <button
              onClick={() => setViewMode('category')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                viewMode === 'category'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              カテゴリー
            </button>
          </div>
        </div>

        {/* カテゴリータブ（カテゴリーモード時のみ） */}
        {viewMode === 'category' && (
          <div className="px-4 mb-4 overflow-x-auto">
            <div className="flex gap-2 pb-2">
              <button
                onClick={() => setSelectedCategory('すべて')}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedCategory === 'すべて'
                    ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-400'
                    : 'bg-slate-800/60 border border-slate-700/50 text-slate-400 hover:text-white'
                }`}
              >
                すべて ({displayArticles.length})
              </button>
              {CATEGORIES.map(cat => (
                categoryCounts[cat] > 0 && (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedCategory === cat
                        ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-400'
                        : 'bg-slate-800/60 border border-slate-700/50 text-slate-400 hover:text-white'
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
        {(loading || isTranslating) && articles.length === 0 && <LoadingSpinner />}

        {isTranslating && articles.length > 0 && (
          <div className="mx-4 mb-4 p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm flex items-center gap-2">
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            {isCategorizing ? 'タイトル翻訳・カテゴリー分類中...' : 'タイトルを日本語に翻訳中...'}
          </div>
        )}

        {/* エラー */}
        {error && (
          <div className="mx-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            エラー: {error}
          </div>
        )}

        {/* 記事なし */}
        {!loading && articles.length === 0 && !error && (
          <div className="mx-4 p-8 rounded-xl bg-slate-800/50 border border-slate-700/50 text-center">
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
              // 全カテゴリーをセクションで表示
              CATEGORIES.map(cat => (
                groupedByCategory[cat]?.length > 0 && (
                  <div key={cat} className="mb-6">
                    <div className="px-4 mb-2 flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white">{cat}</h3>
                      <span className="text-xs text-slate-500">({groupedByCategory[cat].length}件)</span>
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
              // 選択したカテゴリーのみ表示
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
