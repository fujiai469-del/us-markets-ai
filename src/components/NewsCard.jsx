export default function NewsCard({ article, onBookmark, isBookmarked, onAnalyze, analysis, isAnalyzing }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) return '数分前';
    if (hours < 24) return `${hours}時間前`;
    return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
  };

  const getImportanceLabel = (importance) => {
    switch (importance) {
      case '高': return '投資影響: 大';
      case '中': return '投資影響: 中';
      case '低': return '投資影響: 小';
      default: return importance;
    }
  };

  const displayTitle = article.titleJa || article.title;

  const handleCardClick = (e) => {
    // ボタンやリンクがクリックされた場合は何もしない
    if (e.target.closest('button') || e.target.closest('a')) return;
    window.open(article.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      onClick={handleCardClick}
      className="mx-4 mb-3 rounded-xl bg-slate-800/60 border border-slate-700/50 overflow-hidden hover:bg-slate-800/80 transition-all duration-200 cursor-pointer active:scale-[0.98]"
    >
      <div className="flex p-3 gap-3">
        {article.urlToImage && (
          <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden">
            <img
              src={article.urlToImage}
              alt=""
              className="w-full h-full object-cover"
              onError={(e) => { e.target.parentElement.style.display = 'none'; }}
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white line-clamp-2 mb-1">{displayTitle}</h3>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>{article.source?.name}</span>
            <span>•</span>
            <span>{formatDate(article.publishedAt)}</span>
          </div>
        </div>
      </div>

      {/* 記事の概要（常に表示） */}
      {article.description && !analysis && (
        <div className="px-3 pb-2">
          <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{article.description}</p>
        </div>
      )}

      {analysis && (
        <div className="px-3 pb-3">
          <div className="p-2.5 rounded-lg bg-slate-700/50 border border-slate-600/30">
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <span className="text-xs font-medium text-blue-400">AI分析</span>
              {analysis.importance && (
                <span className={`ml-auto text-xs px-1.5 py-0.5 rounded ${
                  analysis.importance === '高' ? 'bg-red-500/20 text-red-400' :
                  analysis.importance === '中' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-green-500/20 text-green-400'
                }`}>
                  {getImportanceLabel(analysis.importance)}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-2">{analysis.summary}</p>
            {analysis.impact && (
              <p className="text-xs text-blue-300/80 leading-relaxed">
                <span className="font-medium">💡 </span>{analysis.impact}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-end px-3 pb-3 gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAnalyze(article);
          }}
          disabled={isAnalyzing || analysis}
          className={`py-2.5 px-4 rounded-xl text-sm font-medium transition-all duration-200 ${
            analysis
              ? 'bg-slate-700 text-slate-500 cursor-default'
              : 'bg-blue-600 text-white disabled:opacity-50 hover:bg-blue-500'
          }`}
        >
          {isAnalyzing ? (
            <span className="flex items-center justify-center gap-1.5">
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              分析中
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
            onBookmark(article);
          }}
          className={`p-2.5 rounded-xl transition-all duration-200 ${
            isBookmarked
              ? 'bg-blue-600 text-white'
              : 'bg-slate-700 text-slate-400 hover:text-white hover:bg-slate-600'
          }`}
        >
          <svg className="w-5 h-5" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
