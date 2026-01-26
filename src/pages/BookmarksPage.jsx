import { useState } from 'react';
import { useBookmarks } from '../hooks/useBookmarks';
import { analyzeNewsArticle } from '../services/geminiApi';
import NewsCard from '../components/NewsCard';

export default function BookmarksPage() {
  const { bookmarks, toggleBookmark, isBookmarked } = useBookmarks();
  const [analyses, setAnalyses] = useState({});
  const [analyzingId, setAnalyzingId] = useState(null);

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
    <div className="flex-1 pb-24 bg-[#141414]">
      <div className="py-5">
        <div className="px-5 mb-5">
          <h2 className="text-xl font-bold text-[#E6E3DC] tracking-wide" style={{fontFamily: 'Georgia, serif'}}>Bookmarks</h2>
          <p className="text-xs text-[#6B7280] mt-0.5 tracking-wider">保存した記事: {bookmarks.length}件</p>
        </div>

        {bookmarks.length === 0 ? (
          <div className="mx-5 p-8 rounded-xl bg-[#1F242B] border border-[#2A2A2A] text-center">
            <svg className="w-12 h-12 mx-auto text-[#6B7280] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            <p className="text-[#9FA3A9]">ブックマークした記事はありません</p>
            <p className="text-[#6B7280] text-sm mt-1">気になる記事をブックマークして保存しましょう</p>
          </div>
        ) : (
          <div>
            {bookmarks.map((article) => (
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
        )}
      </div>
    </div>
  );
}
