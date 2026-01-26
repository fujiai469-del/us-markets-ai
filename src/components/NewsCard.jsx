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

  return (
    <div className="mx-4 mb-3 rounded-xl bg-slate-800/60 border border-slate-700/50 overflow-hidden hover:bg-slate-800/80 transition-all duration-200">
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
          <h3 className="text-sm font-semibold text-white line-clamp-2 mb-1">{article.title}</h3>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>{article.source?.name}</span>
            <span>•</span>
            <span>{formatDate(article.publishedAt)}</span>
          </div>
        </div>
      </div>

      {analysis && (
        <div className="px-3 pb-3">
          <div className="p-2.5 rounded-lg bg-slate-700/50 border border-slate-600/30">
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <span className="text-xs font-medium text-cyan-400">AI要約</span>
              {analysis.importance && (
                <span className={`ml-auto text-xs px-1.5 py-0.5 rounded ${
                  analysis.importance === '高' ? 'bg-red-500/20 text-red-400' :
                  analysis.importance === '中' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-green-500/20 text-green-400'
                }`}>
                  {analysis.importance}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{analysis.summary}</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between px-3 pb-3 gap-2">
        <button
          onClick={() => onAnalyze(article)}
          disabled={isAnalyzing}
          className="flex-1 py-2 px-3 rounded-lg bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 text-cyan-400 text-xs font-medium disabled:opacity-50 hover:from-blue-500/30 hover:to-cyan-500/30 transition-all duration-200"
        >
          {isAnalyzing ? (
            <span className="flex items-center justify-center gap-1.5">
              <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              分析中
            </span>
          ) : (
            'AI分析'
          )}
        </button>
        <button
          onClick={() => onBookmark(article)}
          className={`p-2 rounded-lg border transition-all duration-200 ${
            isBookmarked
              ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
              : 'bg-slate-700/50 border-slate-600/50 text-slate-400 hover:text-white'
          }`}
        >
          <svg className="w-4 h-4" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </button>
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-lg bg-slate-700/50 border border-slate-600/50 text-slate-400 hover:text-white transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
  );
}
