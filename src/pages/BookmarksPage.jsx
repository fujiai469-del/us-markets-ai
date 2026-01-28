import { useState } from 'react';
import { useBookmarks } from '../hooks/useBookmarks';
import { analyzeNewsArticle } from '../services/geminiApi';
import NewsCard from '../components/NewsCard';
import ErrorBoundary from '../components/ErrorBoundary';

export default function BookmarksPage() {
  const { bookmarks, toggleBookmark, isBookmarked } = useBookmarks();
  const [analyses, setAnalyses] = useState({});
  const [analyzingId, setAnalyzingId] = useState(null);

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
            保存した記事
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-1.5">
            ブックマークした記事一覧
            {(bookmarks?.length || 0) > 0 && (
              <span className="ml-2">• {bookmarks.length}件</span>
            )}
          </p>
        </div>

        {(!bookmarks || bookmarks.length === 0) ? (
          <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 300px)' }}>
            <div className="p-16 neu-card text-center animate-fadeIn" style={{ width: '90%', maxWidth: '400px' }}>
              <svg className="w-20 h-20 mx-auto text-[var(--text-light)] mb-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <p className="text-xl text-[var(--text-body)] mb-5 leading-relaxed">
                保存した記事はありません
              </p>
              <p className="text-base text-[var(--text-muted)] leading-relaxed">
                記事をブックマークして<br />後で読む
              </p>
            </div>
          </div>
        ) : (
          <ErrorBoundary>
            <div className="animate-fadeIn">
              <div className="mb-6 flex items-center gap-3">
                <span className="text-xs font-bold text-[var(--text-muted)]">
                  保存済み
                </span>
                <div className="flex-1 h-px bg-gradient-to-r from-[var(--shadow-dark)] to-transparent" />
              </div>
              <div className="card-list">
                {(bookmarks || []).map((article, index) => (
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
          </ErrorBoundary>
        )}
      </div>
    </div>
  );
}
