import { useState } from 'react';
import { useNews } from '../hooks/useNews';
import { useBookmarks } from '../hooks/useBookmarks';
import { analyzeNewsArticle } from '../services/geminiApi';
import NewsCard from '../components/NewsCard';
import ErrorBoundary from '../components/ErrorBoundary';
import { SkeletonList } from '../components/SkeletonCard';

const quickSearches = [
  'Apple',
  'Tesla',
  'NVIDIA',
  'Microsoft',
  'Amazon',
  'Fed',
  'S&P 500',
  'Earnings',
];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const { articles, loading, error, search } = useNews();
  const { toggleBookmark, isBookmarked } = useBookmarks();
  const [analyses, setAnalyses] = useState({});
  const [analyzingId, setAnalyzingId] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setHasSearched(true);
      search(query);
    }
  };

  const handleQuickSearch = (term) => {
    setQuery(term);
    setHasSearched(true);
    search(term);
  };

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

  return (
    <div className="flex-1 pt-8" style={{ paddingBottom: '180px' }}>
      <div className="main-container">
        {/* Section Header */}
        <div className="mb-12 pt-4">
          <h2 className="text-xl font-bold text-[var(--text-heading)]">
            ニュース検索
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-1.5">
            キーワードで記事を探す
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-12">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="検索キーワードを入力..."
              className="input-neu w-full py-4 pl-12 pr-4"
            />
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-light)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-light)] hover:text-[var(--text-muted)] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </form>

        {/* Quick Search */}
        <div className="mb-12">
          <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wide mb-5">
            人気の検索ワード
          </h3>
          <div className="flex flex-wrap gap-4">
            {quickSearches.map((term) => (
              <button
                key={term}
                onClick={() => handleQuickSearch(term)}
                className={`chip-neu ${query === term ? 'active' : ''}`}
              >
                {term}
              </button>
            ))}
          </div>
        </div>

        {loading && <SkeletonList count={3} showFeatured={false} />}

        {error && (
          <div className="p-5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm mb-6">
            エラー: {error}
          </div>
        )}

        {!loading && hasSearched && (!articles || articles.length === 0) && !error && (
          <div className="p-12 neu-card text-center animate-fadeIn">
            <svg className="w-12 h-12 mx-auto text-[var(--text-light)] mb-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-[var(--text-body)]">検索結果が見つかりませんでした</p>
            <p className="text-xs text-[var(--text-muted)] mt-2">別のキーワードをお試しください</p>
          </div>
        )}

        {/* Initial state - removed the large card, just show the form and quick search */}

        {/* Search Results */}
        <ErrorBoundary>
          {hasSearched && !loading && articles?.length > 0 && (
            <div className="animate-fadeIn">
              <div className="mb-6 flex items-center gap-3">
                <span className="text-xs font-bold text-[var(--text-muted)]">
                  {articles.length}件の結果
                </span>
                <div className="flex-1 h-px bg-gradient-to-r from-[var(--shadow-dark)] to-transparent" />
              </div>
              <div className="card-list">
                {(articles || []).map((article, index) => (
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
      </div>
    </div>
  );
}
