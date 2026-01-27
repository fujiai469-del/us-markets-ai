import { useState, useCallback } from 'react';
import { useNews } from '../hooks/useNews';
import { useBookmarks } from '../hooks/useBookmarks';
import { analyzeNewsArticle } from '../services/geminiApi';
import NewsCard from '../components/NewsCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorBoundary from '../components/ErrorBoundary';
import { SkeletonCard } from '../components/SkeletonCard';

const quickSearches = [
  'アップル',
  'テスラ',
  'エヌビディア',
  'マイクロソフト',
  'アマゾン',
  'FRB 金利',
  'インフレ',
  '決算発表',
];

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

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const { articles, loading, error, search } = useNews();
  const { toggleBookmark, isBookmarked } = useBookmarks();
  const [analyses, setAnalyses] = useState({});
  const [analyzingId, setAnalyzingId] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (e) => {
    e?.preventDefault();
    if (query?.trim()) {
      setHasSearched(true);
      search(query);
    }
  };

  const handleQuickSearch = (term) => {
    if (!term) return;
    setQuery(term);
    setHasSearched(true);
    search(term);
  };

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

  const safeArticles = articles || [];

  return (
    <div className="flex-1 pb-24 bg-[#141414]">
      <div className="py-6 px-5">
        {/* ヘッダー */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-[#E6E3DC] tracking-wide" style={{fontFamily: 'Georgia, serif'}}>Search News</h2>
          <p className="text-xs text-[#6B7280] mt-1 tracking-wider">ニュース検索</p>
        </div>

        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e?.target?.value || '')}
              placeholder="キーワードを入力..."
              className="w-full py-3.5 pl-12 pr-4 rounded-xl bg-[#1F242B] border border-[#2A2A2A] text-[#E6E3DC] placeholder-[#6B7280] focus:outline-none focus:border-[#B59A5A]/50 focus:ring-1 focus:ring-[#B59A5A]/30 transition-all"
            />
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </form>

        <div className="mb-6">
          <h3 className="text-sm font-medium text-[#9FA3A9] mb-3">クイック検索</h3>
          <div className="flex flex-wrap gap-2">
            {quickSearches?.map((term) => (
              <button
                key={term}
                onClick={() => handleQuickSearch(term)}
                className="px-4 py-2 rounded-xl bg-[#1F242B] border border-[#2A2A2A] text-[#9FA3A9] text-sm hover:border-[#B59A5A]/30 hover:text-[#E6E3DC] transition-all duration-300"
              >
                {term}
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="space-y-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-[#A65D57]/10 border border-[#A65D57]/30 text-[#D4847E] text-sm">
            エラー: {error}
          </div>
        )}

        {!loading && hasSearched && safeArticles.length === 0 && !error && (
          <div className="p-8 rounded-xl bg-[#1F242B] border border-[#2A2A2A] text-center">
            <p className="text-[#6B7280]">検索結果が見つかりませんでした</p>
          </div>
        )}

        {!hasSearched && !loading && (
          <div className="p-8 rounded-xl bg-[#1F242B] border border-[#2A2A2A] text-center">
            <svg className="w-12 h-12 mx-auto text-[#6B7280] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-[#6B7280]">キーワードを入力してニュースを検索</p>
          </div>
        )}
      </div>

      {!loading && safeArticles.length > 0 && (
        <ErrorBoundary>
          <div className="mt-2">
            {safeArticles.map((article) => (
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
        </ErrorBoundary>
      )}
    </div>
  );
}
