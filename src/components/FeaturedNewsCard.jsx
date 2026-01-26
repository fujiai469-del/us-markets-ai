export default function FeaturedNewsCard({ article, onBookmark, isBookmarked, onAnalyze, analysis, isAnalyzing }) {
  if (!article) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getImportanceLabel = (importance) => {
    switch (importance) {
      case '高': return '投資影響: 大';
      case '中': return '投資影響: 中';
      case '低': return '投資影響: 小';
      default: return importance;
    }
  };

  return (
    <div className="mx-4 mb-4 rounded-2xl bg-slate-800/80 overflow-hidden gradient-border shadow-lg shadow-black/20">
      {article.urlToImage && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={article.urlToImage}
            alt={article.title}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent" />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-400">{article.source?.name}</span>
          <span className="text-xs text-slate-500">{formatDate(article.publishedAt)}</span>
        </div>
        <h2 className="text-lg font-bold text-white mb-2 line-clamp-2">{article.title}</h2>

        {/* 記事の概要（AI分析前に表示） */}
        {article.description && !analysis && (
          <p className="text-sm text-slate-400 leading-relaxed mb-3 line-clamp-3">{article.description}</p>
        )}

        {analysis && (
          <div className="mb-3 p-3 rounded-xl bg-slate-700/50 border border-slate-600/50">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <span className="text-xs font-semibold text-cyan-400">AI分析</span>
              {analysis.importance && (
                <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
                  analysis.importance === '高' ? 'bg-red-500/20 text-red-400' :
                  analysis.importance === '中' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-green-500/20 text-green-400'
                }`}>
                  {getImportanceLabel(analysis.importance)}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">{analysis.summary}</p>
            {analysis.impact && (
              <p className="text-sm text-cyan-300/80 mt-2">
                <span className="font-medium">💡 </span>{analysis.impact}
              </p>
            )}
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={() => onAnalyze(article)}
            disabled={isAnalyzing || analysis}
            className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
              analysis
                ? 'bg-slate-700/50 text-slate-400 cursor-default'
                : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white disabled:opacity-50 hover:shadow-lg hover:shadow-cyan-500/20'
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
              '分析済み ✓'
            ) : (
              'AIで分析する'
            )}
          </button>
          <button
            onClick={() => onBookmark(article)}
            className={`p-2.5 rounded-xl border transition-all duration-200 ${
              isBookmarked
                ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                : 'bg-slate-700/50 border-slate-600/50 text-slate-400 hover:text-white'
            }`}
          >
            <svg className="w-5 h-5" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 rounded-xl bg-slate-700/50 border border-slate-600/50 text-slate-400 hover:text-white transition-all duration-200"
            title="元記事を読む"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
