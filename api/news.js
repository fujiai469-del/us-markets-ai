// ============================================================================
// IMPORTANT: NewsAPI Free Plan Limitations
// ============================================================================
// The free/developer plan of NewsAPI does NOT support:
// - `domains` parameter in /v2/everything endpoint
// - `sources` parameter in /v2/everything endpoint
// Using these parameters will result in a 426 "Upgrade Required" error.
//
// Solution: We fetch without domain filtering at API level, then filter
// results on the server-side using our trusted/blacklisted source lists.
// ============================================================================

// Trusted sources for post-fetch filtering (checked against source.name and url)
const TRUSTED_SOURCES = [
  'bloomberg', 'reuters', 'cnbc', 'wsj', 'wall street journal',
  'financial times', 'ft.com', 'marketwatch', 'barrons',
  'the verge', 'techcrunch', 'wired', 'ars technica',
  'new york times', 'nytimes', 'washington post', 'bbc', 'cnn',
  'associated press', 'ap news', 'business insider', 'fortune', 'forbes',
  'axios', 'politico', 'npr', 'economist',
  'seeking alpha', 'benzinga', 'investopedia', 'yahoo finance',
  'abc news', 'cbs news', 'nbc news', 'usa today',
];

// Blacklisted sources to exclude (low quality / not relevant)
const BLACKLISTED_SOURCES = [
  'freerepublic', 'zerohedge', 'infowars',
  'breitbart', 'newsmax', 'beforeitsnews',
  'naturalnews', 'thegatewaypundit', 'oann',
  'bigleaguepolitics', 'theblaze', 'pjmedia',
  'dailywire',
];

/**
 * Check if an article is from a trusted source
 */
function isTrustedSource(article) {
  const sourceName = (article.source?.name || '').toLowerCase();
  const articleUrl = (article.url || '').toLowerCase();
  return TRUSTED_SOURCES.some(trusted =>
    sourceName.includes(trusted) || articleUrl.includes(trusted)
  );
}

/**
 * Check if an article is from a blacklisted source
 */
function isBlacklistedSource(article) {
  const sourceName = (article.source?.name || '').toLowerCase();
  const articleUrl = (article.url || '').toLowerCase();
  return BLACKLISTED_SOURCES.some(blocked =>
    sourceName.includes(blocked) || articleUrl.includes(blocked)
  );
}

/**
 * Filter and sort articles by source quality
 */
function filterAndSortByQuality(articles) {
  if (!articles || !Array.isArray(articles)) return [];

  // Remove blacklisted sources
  const filtered = articles.filter(article => !isBlacklistedSource(article));

  // Sort: trusted sources first, then by date
  return filtered.sort((a, b) => {
    const aTrusted = isTrustedSource(a) ? 1 : 0;
    const bTrusted = isTrustedSource(b) ? 1 : 0;

    if (bTrusted !== aTrusted) {
      return bTrusted - aTrusted; // Trusted sources first
    }

    // Same trust level: sort by date (newest first)
    return new Date(b.publishedAt) - new Date(a.publishedAt);
  });
}

export default async function handler(req, res) {
  const { type, query, tickers } = req.query;
  const apiKey = process.env.VITE_NEWS_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  let url;
  // NOTE: Do NOT use 'domains' or 'sources' parameters - they require paid plan
  const baseParams = `language=en&apiKey=${apiKey}`;

  if (type === 'watchlist' && tickers) {
    // マイ銘柄用: ティッカーシンボルと企業名で検索
    const tickerList = tickers.split(',').map(t => t.trim()).filter(Boolean);
    if (tickerList.length === 0) {
      return res.status(200).json({ articles: [] });
    }
    // Build search query with tickers and company names
    const tickerQuery = tickerList.map(t => `"${t}"`).join(' OR ');
    const fullQuery = `(${tickerQuery}) AND (stock OR shares OR earnings OR market OR investor)`;
    // NO domains parameter - will filter server-side
    url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(fullQuery)}&${baseParams}&sortBy=relevancy&pageSize=50`;
  } else if (type === 'search' && query) {
    // 検索時は株・金融関連に絞る
    const searchQuery = `${query} AND (stock OR market OR trading OR investor OR earnings OR "Wall Street")`;
    // NO domains parameter - will filter server-side
    url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(searchQuery)}&${baseParams}&sortBy=relevancy&pageSize=40`;
  } else if (type === 'stocks') {
    // 米国株・金融に特化したキーワード（US市場に限定）
    const stockQuery = '(NYSE OR NASDAQ OR "S&P 500" OR "Dow Jones" OR "Wall Street" OR "Federal Reserve" OR Fed) AND (stock OR shares OR trading OR investor OR market OR earnings)';
    // NO domains parameter - will filter server-side
    url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(stockQuery)}&${baseParams}&sortBy=publishedAt&pageSize=50`;
  } else {
    // ビジネストップニュース（米国のみ） - top-headlines doesn't have domain restrictions
    url = `https://newsapi.org/v2/top-headlines?country=us&category=business&pageSize=25&apiKey=${apiKey}`;
  }

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      console.error('NewsAPI Error:', data);
      return res.status(response.status).json(data);
    }

    // Apply server-side filtering for source quality
    if (data.articles) {
      data.articles = filterAndSortByQuality(data.articles);
      // Limit to reasonable number after filtering
      data.articles = data.articles.slice(0, 30);
    }

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
    return res.status(200).json(data);
  } catch (error) {
    console.error('API Handler Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
