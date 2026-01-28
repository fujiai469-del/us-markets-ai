import { getRegionLabel } from '../utils/newsFilters';

export default function FeaturedNewsCard({ article, onBookmark, isBookmarked, onAnalyze, analysis, isAnalyzing }) {
  // Guard clause - return null if article is undefined
  if (!article) return null;

  const regionLabel = getRegionLabel(article);

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

  const getSentimentClass = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'tag-sentiment tag-sentiment-positive';
      case 'negative': return 'tag-sentiment tag-sentiment-negative';
      default: return 'tag-sentiment tag-sentiment-neutral';
    }
  };

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case 'positive':
        return (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        );
      case 'negative':
        return (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
          </svg>
        );
      default:
        return (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        );
    }
  };

  const getSentimentLabel = (sentiment) => {
    switch (sentiment) {
      case 'positive': return '強気';
      case 'negative': return '弱気';
      default: return '中立';
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
      className="neu-card overflow-hidden cursor-pointer active:scale-[0.998] transition-all duration-300"
    >
      {/* Main Image - Reduced height on mobile */}
      {article?.urlToImage && (
        <div className="relative h-40 sm:h-44 overflow-hidden">
          <img
            src={article.urlToImage}
            alt={displayTitle}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

          {/* Featured Badge */}
          <div className="absolute top-3 left-3 sm:top-4 sm:left-4 badge-featured text-[10px] sm:text-[11px] px-3 py-1.5 sm:px-4 sm:py-2">
            注目
          </div>
        </div>
      )}

      <div className="p-6 sm:p-8 md:p-10">
        {/* Source and Date */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-4 sm:mb-6">
          <span className="text-[11px] sm:text-xs font-semibold text-[var(--accent-blue)] uppercase tracking-wide truncate max-w-[150px] sm:max-w-none">
            {article?.source?.name || 'Unknown'}
          </span>
          <span className="text-[10px] sm:text-[11px] text-[var(--text-light)] whitespace-nowrap">
            • {formatDate(article?.publishedAt)}
          </span>
        </div>

        {/* Title */}
        <h2 className="text-[16px] sm:text-[18px] font-bold text-[var(--text-heading)] mb-5 sm:mb-6 leading-relaxed line-clamp-3">
          {regionLabel && (
            <span className="inline-block text-[10px] sm:text-[11px] font-bold text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded mr-2 align-middle">
              {regionLabel}
            </span>
          )}
          {displayTitle}
        </h2>

        {/* AI Analysis Result */}
        {analysis && (
          <div className="mb-5 sm:mb-7 p-4 sm:p-6 analysis-card">
            {/* Header with sentiment and importance - Left aligned with gap */}
            <div className="flex flex-wrap items-center justify-start gap-2 mb-4">
              {/* Sentiment Tag - Unified size */}
              {analysis?.sentiment && (
                <div className={getSentimentClass(analysis.sentiment)}>
                  {getSentimentIcon(analysis.sentiment)}
                  <span>{getSentimentLabel(analysis.sentiment)}</span>
                </div>
              )}
              {/* Importance Tag - Unified size */}
              {analysis?.importance && (
                <span className={getImportanceBadgeClass(analysis.importance)}>
                  {getImportanceLabel(analysis.importance)}
                </span>
              )}
            </div>
            {/* Summary with improved mobile readability */}
            <p className="text-[14px] sm:text-[13px] text-[var(--text-body)] leading-[1.6] sm:leading-relaxed">
              {analysis?.summary || ''}
            </p>
            {analysis?.impact && (
              <p className="text-[12px] text-[var(--text-muted)] mt-3 sm:mt-4 leading-[1.6] sm:leading-relaxed">
                <span className="text-[var(--accent-blue)] font-bold mr-1">→</span> {analysis.impact}
              </p>
            )}
            {/* Related Tickers */}
            {analysis?.tickers && analysis.tickers.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-[var(--shadow-dark)]/30">
                <span className="text-[10px] text-[var(--text-muted)]">関連銘柄:</span>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.tickers.map((ticker) => (
                    <span key={ticker} className="text-[10px] font-semibold text-[var(--accent-blue)] bg-[var(--accent-blue)]/10 px-2 py-0.5 rounded">
                      ${ticker}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons - moved up, no divider */}
        <div className="flex items-center justify-end gap-3 sm:gap-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onAnalyze && article) {
                onAnalyze(article);
              }
            }}
            disabled={isAnalyzing || analysis}
            className={`btn-neu text-[12px] sm:text-[13px] min-h-[44px] ${analysis ? 'opacity-50 cursor-default' : ''}`}
          >
            {isAnalyzing ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
            className={`icon-btn-neu ${isBookmarked ? 'active' : ''}`}
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
