export default function FeaturedNewsCard({ article, onBookmark, isBookmarked, onAnalyze, analysis, isAnalyzing }) {
  // Early return if article is null/undefined
  if (!article) return null;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const getImportanceLabel = (importance) => {
    switch (importance) {
      case '高': return '重要度: 高';
      case '中': return '重要度: 中';
      case '低': return '重要度: 低';
      default: return importance || '';
    }
  };

  const displayTitle = article?.titleJa || article?.title || 'タイトルなし';

  const handleCardClick = (e) => {
    if (e?.target?.closest('button') || e?.target?.closest('a')) return;
    if (article?.url) {
      window.open(article.url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleAnalyzeClick = (e) => {
    e?.stopPropagation();
    if (onAnalyze && article) {
      onAnalyze(article);
    }
  };

  const handleBookmarkClick = (e) => {
    e?.stopPropagation();
    if (onBookmark && article) {
      onBookmark(article);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="mx-4 mb-5 rounded-2xl bg-[#1F242B] border border-[#2A2A2A] overflow-hidden cursor-pointer active:scale-[0.99] transition-transform card-gold-border"
    >
      {article?.urlToImage && (
        <div className="relative h-52 overflow-hidden">
          <img
            src={article.urlToImage}
            alt={displayTitle}
            className="w-full h-full object-cover"
            onError={(e) => { if (e?.target) e.target.style.display = 'none'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/60 to-transparent" />
          {/* トップニュースバッジ */}
          <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#B59A5A]/90 text-[#141414] text-xs font-semibold tracking-wide">
            TOP NEWS
          </div>
        </div>
      )}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-[#B59A5A] font-medium truncate max-w-[180px]">{article?.source?.name || 'Unknown'}</span>
          <span className="text-xs text-[#6B7280]">{formatDate(article?.publishedAt)}</span>
        </div>
        <h2 className="text-xl font-bold text-[#E6E3DC] mb-4 leading-relaxed line-clamp-3" style={{fontFamily: 'Georgia, serif'}}>
          {displayTitle}
        </h2>

        {article?.description && !analysis && (
          <p className="text-sm text-[#9FA3A9] leading-relaxed mb-5 line-clamp-2">{article.description}</p>
        )}

        {analysis && (
          <div className="mb-5 p-5 rounded-xl bg-[#141414] border border-[#B59A5A]/20">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-full bg-[#B59A5A]/20 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-[#B59A5A]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <span className="text-sm font-semibold text-[#B59A5A] tracking-wide">AI分析</span>
              {analysis?.importance && (
                <span className={`ml-auto text-xs px-2.5 py-1 rounded-full font-medium ${
                  analysis.importance === '高' ? 'bg-[#A65D57]/20 text-[#D4847E]' :
                  analysis.importance === '中' ? 'bg-[#B59A5A]/20 text-[#B59A5A]' :
                  'bg-[#6E5A3C]/20 text-[#9C8450]'
                }`}>
                  {getImportanceLabel(analysis.importance)}
                </span>
              )}
            </div>
            <p className="text-sm text-[#E6E3DC] leading-relaxed line-clamp-3">{analysis?.summary || ''}</p>
            {analysis?.impact && (
              <p className="text-sm text-[#9FA3A9] mt-4 leading-relaxed line-clamp-2">
                <span className="text-[#B59A5A]">▸ </span>{analysis.impact}
              </p>
            )}
          </div>
        )}

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={handleAnalyzeClick}
            disabled={isAnalyzing || analysis}
            className={`py-3 px-6 rounded-xl text-sm font-semibold transition-all duration-300 ${
              analysis
                ? 'bg-[#1C1B1A] text-[#6B7280] cursor-default border border-[#2A2A2A]'
                : 'bg-gradient-to-r from-[#B59A5A] to-[#9C8450] text-[#141414] disabled:opacity-50 hover:from-[#C4A96A] hover:to-[#AB9360] shadow-lg shadow-[#B59A5A]/10'
            }`}
          >
            {isAnalyzing ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                分析中...
              </span>
            ) : analysis ? (
              '分析済み'
            ) : (
              'AI分析'
            )}
          </button>
          <button
            onClick={handleBookmarkClick}
            className={`p-3 rounded-xl transition-all duration-300 border ${
              isBookmarked
                ? 'bg-[#B59A5A]/20 border-[#B59A5A]/50 text-[#B59A5A]'
                : 'bg-[#1C1B1A] border-[#2A2A2A] text-[#6B7280] hover:text-[#B59A5A] hover:border-[#B59A5A]/30'
            }`}
          >
            <svg className="w-5 h-5" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
