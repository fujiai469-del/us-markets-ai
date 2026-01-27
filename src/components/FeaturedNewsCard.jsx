export default function FeaturedNewsCard({ article, onBookmark, isBookmarked, onAnalyze, analysis, isAnalyzing }) {
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
      {/* Main Image */}
      {article?.urlToImage && (
        <div className="relative h-44 overflow-hidden">
          <img
            src={article.urlToImage}
            alt={displayTitle}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

          {/* Featured Badge */}
          <div className="absolute top-4 left-4 badge-featured">
            注目
          </div>
        </div>
      )}

      <div className="p-7 sm:p-8">
        {/* Source and Date */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-5">
          <span className="text-xs font-semibold text-[var(--accent-blue)] uppercase tracking-wide truncate max-w-[180px] sm:max-w-none">
            {article?.source?.name || 'Unknown'}
          </span>
          <span className="text-[11px] text-[var(--text-light)] whitespace-nowrap">
            • {formatDate(article?.publishedAt)}
          </span>
        </div>

        {/* Title */}
        <h2 className="text-[17px] font-bold text-[var(--text-heading)] mb-5 leading-snug line-clamp-3">
          {displayTitle}
        </h2>

        {/* Description (when no analysis) */}
        {article?.description && !analysis && (
          <p className="text-[13px] text-[var(--text-muted)] leading-relaxed mb-6 line-clamp-2">
            {article.description}
          </p>
        )}

        {/* AI Analysis Result */}
        {analysis && (
          <div className="mb-7 p-6 analysis-card">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[var(--accent-blue-light)] to-[var(--accent-blue)] flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
              <span className="text-[10px] font-bold text-[var(--accent-blue)] uppercase tracking-wide">
                AI分析
              </span>
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
              <p className="text-[12px] text-[var(--text-muted)] mt-4 leading-relaxed line-clamp-2">
                <span className="text-[var(--accent-blue)] font-bold mr-1">→</span> {analysis.impact}
              </p>
            )}
          </div>
        )}

        {/* Divider */}
        <div className="divider mb-6" />

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onAnalyze && article) {
                onAnalyze(article);
              }
            }}
            disabled={isAnalyzing || analysis}
            className={analysis ? 'btn-neu opacity-50 cursor-default text-[13px]' : 'btn-neu-primary text-[13px]'}
          >
            {isAnalyzing ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                分析中...
              </span>
            ) : analysis ? (
              '分析済み'
            ) : (
              'AIで分析'
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
