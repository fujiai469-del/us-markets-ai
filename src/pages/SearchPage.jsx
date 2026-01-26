import { useState } from 'react';
import { useNews } from '../hooks/useNews';
import { useBookmarks } from '../hooks/useBookmarks';
import { analyzeNewsArticle } from '../services/geminiApi';
import NewsCard from '../components/NewsCard';
import LoadingSpinner from '../components/LoadingSpinner';

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
    <div className="flex-1 pb-24">
      <div className="py-4 px-4">
        <form onSubmit={handleSearch} className="mb-4">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ニュースを検索..."
              className="w-full py-3 pl-11 pr-4 rounded-xl bg-slate-800/80 border border-slate-700/50 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all"
            />
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </form>

        <div className="mb-6">
          <h3 className="text-sm font-medium text-slate-400 mb-2">クイック検索</h3>
          <div className="flex flex-wrap gap-2">
            {quickSearches.map((term) => (
              <button
                key={term}
                onClick={() => handleQuickSearch(term)}
                className="px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-300 text-sm hover:bg-slate-700 hover:border-slate-600 transition-all"
              >
                {term}
              </button>
            ))}
          </div>
        </div>

        {loading && <LoadingSpinner />}

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            エラー: {error}
          </div>
        )}

        {!loading && hasSearched && articles.length === 0 && !error && (
          <div className="p-8 rounded-xl bg-slate-800/50 border border-slate-700/50 text-center">
            <p className="text-slate-400">検索結果が見つかりませんでした</p>
          </div>
        )}

        {!hasSearched && !loading && (
          <div className="p-8 rounded-xl bg-slate-800/50 border border-slate-700/50 text-center">
            <svg className="w-12 h-12 mx-auto text-slate-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-slate-400">キーワードを入力してニュースを検索</p>
          </div>
        )}
      </div>

      <div>
        {articles.map((article) => (
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
  );
}
