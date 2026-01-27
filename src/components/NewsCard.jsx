export default function NewsCard({ article, onBookmark, isBookmarked, onAnalyze, analysis, isAnalyzing }) {
  // Guard clause - return null if article is undefined
  if (!article) return null;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' });
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

  const getImportanceBadgeClass = (importance) => {
    switch (importance) {
      case '高': return 'badge-high';
      case '中': return 'badge-medium';
      case '低': return 'badge-low';
      default: return 'badge-medium';
    }
  };

  const getSentimentDisplay = (sentiment) => {
    switch (sentiment) {
      case 'positive':
        return {
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          ),
          label: '強気',
          bgClass: 'bg-green-50',
          textClass: 'text-green-600',
          borderClass: 'border-green-200',
        };
      case 'negative':
        return {
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
            </svg>
          ),
          label: '弱気',
          bgClass: 'bg-red-50',
          textClass: 'text-red-600',
          borderClass: 'border-red-200',
        };
      default:
        return {
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          ),
          label: '中立',
          bgClass: 'bg-gray-50',
          textClass: 'text-gray-600',
          borderClass: 'border-gray-200',
        };
    }
  };

  const displayTitle = article?.titleJa || article?.title || 'タイトルなし';

  const handleCardClick = (e) => {
    if (e.target.closest('button') || e.target.closest('a')) return;
    if (article?.url) {
      window.open(article.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="neu-flat overflow-hidden cursor-pointer active:scale-[0.998] transition-all duration-300"
    >
      <div className="flex items-center gap-6 p-8">
        {/* Thumbnail - Always show, with placeholder if no image */}
        <div className="relative w-[80px] h-[80px] flex-shrink-0 overflow-hidden rounded-xl neu-inset">
          {article?.urlToImage ? (
            <img
              src={article.urlToImage}
              alt={displayTitle}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          {/* Placeholder - shown when no image or image fails to load */}
          <div
            className="absolute inset-0 flex items-center justify-center bg-[var(--bg-secondary)]"
            style={{ display: article?.urlToImage ? 'none' : 'flex' }}
          >
            <svg
              className="w-8 h-8 text-[var(--text-light)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
              />
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Source and Date - Responsive layout */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-4">
            <span className="text-[11px] font-semibold text-[var(--accent-blue)] uppercase tracking-wide truncate max-w-[150px] sm:max-w-none">
              {article?.source?.name || 'Unknown'}
            </span>
            <span className="text-[10px] text-[var(--text-light)] whitespace-nowrap">
              • {formatDate(article?.publishedAt)}
            </span>
          </div>

          <h3 className="text-[15px] font-bold text-[var(--text-heading)] leading-relaxed line-clamp-2">
            {displayTitle}
          </h3>

          {/* Category */}
          {article?.category && typeof article.category === 'string' && (
            <span className="mt-5 text-[10px] font-medium text-[var(--text-muted)] bg-[var(--bg-secondary)] py-2 px-4 rounded-lg self-start">
              {article.category}
            </span>
          )}
        </div>
      </div>

      {/* AI Analysis Result */}
      {analysis && (
        <div className="mx-8 mb-7 p-6 analysis-card">
          {/* Header with sentiment indicator */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {/* Sentiment Icon */}
            {analysis?.sentiment && (
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${getSentimentDisplay(analysis.sentiment).bgClass} ${getSentimentDisplay(analysis.sentiment).borderClass}`}>
                <span className={getSentimentDisplay(analysis.sentiment).textClass}>
                  {getSentimentDisplay(analysis.sentiment).icon}
                </span>
                <span className={`text-[10px] font-bold ${getSentimentDisplay(analysis.sentiment).textClass}`}>
                  {getSentimentDisplay(analysis.sentiment).label}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[var(--accent-blue-light)] to-[var(--accent-blue)] flex items-center justify-center flex-shrink-0">
                <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
              <span className="text-[10px] font-bold text-[var(--accent-blue)] uppercase tracking-wide">
                AI分析
              </span>
            </div>
            {analysis?.importance && (
              <span className={`ml-auto text-[10px] ${getImportanceBadgeClass(analysis.importance)}`}>
                {getImportanceLabel(analysis.importance)}
              </span>
            )}
          </div>
          <p className="text-[13px] text-[var(--text-body)] leading-relaxed line-clamp-3">
            {analysis?.summary || ''}
          </p>
          {analysis?.impact && (
            <p className="text-[12px] text-[var(--text-muted)] mt-3 leading-relaxed line-clamp-2">
              <span className="text-[var(--accent-blue)] font-bold mr-1">→</span> {analysis.impact}
            </p>
          )}
          {/* Related Tickers */}
          {analysis?.tickers && analysis.tickers.length > 0 && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[var(--shadow-dark)]/30">
              <span className="text-[10px] text-[var(--text-muted)]">関連:</span>
              <div className="flex flex-wrap gap-1">
                {analysis.tickers.map((ticker) => (
                  <span key={ticker} className="text-[10px] font-semibold text-[var(--accent-blue)] bg-[var(--accent-blue)]/10 px-1.5 py-0.5 rounded">
                    ${ticker}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-4 px-8 pb-8">
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onAnalyze && article) {
              onAnalyze(article);
            }
          }}
          disabled={isAnalyzing || analysis}
          className={`btn-neu btn-neu-sm text-[12px] ${analysis ? 'opacity-50 cursor-default' : ''}`}
        >
          {isAnalyzing ? (
            <span className="flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-[var(--shadow-dark)] border-t-[var(--accent-blue)] rounded-full animate-spin" />
              分析中...
            </span>
          ) : analysis ? (
            '分析済み'
          ) : (
            'AI分析'
          )}
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onBookmark && article) {
              onBookmark(article);
            }
          }}
          className={`w-11 h-11 flex items-center justify-center rounded-xl transition-all duration-200 flex-shrink-0 ${isBookmarked
            ? 'neu-inset text-[var(--accent-blue)]'
            : 'neu-raised-sm text-[var(--text-light)] hover:text-[var(--accent-blue)]'
            }`}
        >
          <svg className="w-[18px] h-[18px]" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
