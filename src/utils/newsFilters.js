// News filtering utilities

// Trusted news sources (whitelist)
export const TRUSTED_SOURCES = [
  // Major Financial News
  'bloomberg', 'reuters', 'cnbc', 'wsj', 'wall street journal',
  'financial times', 'ft.com', 'marketwatch', 'barrons', 'investor',
  'yahoo finance', 'seeking alpha', 'motley fool', 'benzinga',
  // Major Tech News
  'the verge', 'techcrunch', 'wired', 'ars technica', 'engadget',
  'zdnet', 'cnet', 'venturebeat', 'the information',
  // Major General News
  'associated press', 'ap news', 'new york times', 'nytimes',
  'washington post', 'bbc', 'cnn', 'abc news', 'cbs news', 'nbc news',
  'usa today', 'politico', 'axios', 'business insider', 'fortune',
  'forbes', 'npr', 'the guardian', 'the economist',
];

// Untrusted/low-quality sources (blacklist)
export const BLACKLISTED_SOURCES = [
  'free republic', 'freerepublic', 'zerohedge', 'infowars',
  'breitbart', 'dailywire', 'oann', 'newsmax',
  'beforeitsnews', 'naturalnews', 'thegatewaypundit',
  'bigleaguepolitics', 'theblaze', 'pjmedia',
  // Low-quality aggregators
  'google news', 'yahoo', 'msn.com', 'aol.com',
  // User-generated content
  'reddit', 'quora', 'medium.com',
  // Non-US regional sources (to be filtered separately)
];

// Non-US regional patterns for detection
export const NON_US_PATTERNS = {
  australia: {
    keywords: ['asx', 'australia', 'australian', 'sydney', 'melbourne', 'canberra', 'aud'],
    sources: ['abc.net.au', 'smh.com.au', 'theaustralian', 'news.com.au', 'afr.com'],
    label: 'オーストラリア'
  },
  india: {
    keywords: ['nse', 'bse', 'sensex', 'nifty', 'india', 'indian', 'mumbai', 'delhi', 'rupee', 'inr'],
    sources: ['economictimes.indiatimes', 'moneycontrol', 'livemint', 'ndtv', 'zeenews', 'hindustantimes'],
    label: 'インド'
  },
  uk: {
    keywords: ['ftse', 'london stock', 'uk market', 'british', 'sterling', 'gbp', 'bank of england'],
    sources: ['telegraph.co.uk', 'thesun.co.uk', 'dailymail.co.uk', 'mirror.co.uk'],
    label: 'イギリス'
  },
  europe: {
    keywords: ['dax', 'cac 40', 'euro stoxx', 'ecb', 'eurozone', 'european central bank'],
    sources: ['spiegel.de', 'lemonde.fr'],
    label: 'ヨーロッパ'
  },
  china: {
    keywords: ['shanghai composite', 'hang seng', 'china market', 'chinese stock', 'yuan', 'cny', 'pboc'],
    sources: ['scmp.com', 'xinhua', 'chinadaily'],
    label: '中国'
  },
  japan: {
    keywords: ['nikkei', 'topix', 'tokyo stock', 'yen', 'jpy', 'bank of japan', 'boj'],
    sources: ['japantimes', 'nikkei.com', 'mainichi'],
    label: '日本'
  },
  canada: {
    keywords: ['tsx', 'toronto stock', 'canadian', 'cad', 'bank of canada', 'loonie'],
    sources: ['globalnews.ca', 'cbc.ca', 'theglobeandmail'],
    label: 'カナダ'
  }
};

// US-specific keywords that indicate US market relevance
export const US_MARKET_KEYWORDS = [
  'nyse', 'nasdaq', 's&p 500', 's&p500', 'dow jones', 'djia',
  'wall street', 'fed', 'federal reserve', 'fomc', 'powell',
  'treasury', 'sec', 'u.s.', 'us market', 'american',
  'dollar', 'usd'
];

/**
 * Check if a source is trusted
 */
export function isTrustedSource(sourceName) {
  if (!sourceName) return false;
  const lowerSource = sourceName.toLowerCase();
  return TRUSTED_SOURCES.some(trusted => lowerSource.includes(trusted));
}

/**
 * Check if a source is blacklisted
 */
export function isBlacklistedSource(sourceName, url) {
  if (!sourceName && !url) return false;
  const lowerSource = (sourceName || '').toLowerCase();
  const lowerUrl = (url || '').toLowerCase();

  return BLACKLISTED_SOURCES.some(blocked =>
    lowerSource.includes(blocked) || lowerUrl.includes(blocked)
  );
}

/**
 * Detect the region of an article
 * Returns { isUS: boolean, region: string | null, label: string | null }
 */
export function detectArticleRegion(article) {
  if (!article) return { isUS: true, region: null, label: null };

  const title = (article.title || '').toLowerCase();
  const description = (article.description || '').toLowerCase();
  const sourceName = (article.source?.name || '').toLowerCase();
  const url = (article.url || '').toLowerCase();
  const content = `${title} ${description}`;

  // Check for explicit US market indicators first
  const hasUSIndicator = US_MARKET_KEYWORDS.some(keyword =>
    content.includes(keyword.toLowerCase())
  );

  // Check each non-US region
  for (const [region, config] of Object.entries(NON_US_PATTERNS)) {
    // Check source first
    const isFromRegionalSource = config.sources.some(source =>
      sourceName.includes(source) || url.includes(source)
    );

    // Check keywords
    const hasRegionalKeyword = config.keywords.some(keyword =>
      content.includes(keyword.toLowerCase())
    );

    // If strong regional indicator and no US indicator, mark as non-US
    if ((isFromRegionalSource || hasRegionalKeyword) && !hasUSIndicator) {
      return { isUS: false, region, label: config.label };
    }

    // If regional indicator but also US indicator, might be comparative article
    if (hasRegionalKeyword && hasUSIndicator) {
      return { isUS: true, region, label: config.label };
    }
  }

  return { isUS: true, region: null, label: null };
}

/**
 * Calculate similarity between two strings (simple Jaccard similarity)
 */
function calculateSimilarity(str1, str2) {
  if (!str1 || !str2) return 0;

  const words1 = new Set(str1.toLowerCase().split(/\s+/).filter(w => w.length > 3));
  const words2 = new Set(str2.toLowerCase().split(/\s+/).filter(w => w.length > 3));

  if (words1.size === 0 || words2.size === 0) return 0;

  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);

  return intersection.size / union.size;
}

/**
 * Check if two articles are duplicates
 */
export function isDuplicateArticle(article1, article2, threshold = 0.6) {
  if (!article1 || !article2) return false;

  // Same URL is definitely duplicate
  if (article1.url === article2.url) return true;

  // Check title similarity
  const titleSimilarity = calculateSimilarity(article1.title, article2.title);
  if (titleSimilarity > threshold) return true;

  // Check description similarity if titles are somewhat similar
  if (titleSimilarity > 0.3) {
    const descSimilarity = calculateSimilarity(article1.description, article2.description);
    if (descSimilarity > threshold) return true;
  }

  return false;
}

/**
 * Deduplicate articles based on URL and content similarity
 */
export function deduplicateArticles(articles, threshold = 0.6) {
  if (!articles || articles.length === 0) return [];

  const unique = [];

  for (const article of articles) {
    const isDupe = unique.some(existing => isDuplicateArticle(existing, article, threshold));
    if (!isDupe) {
      unique.push(article);
    }
  }

  return unique;
}

/**
 * Filter and score articles for quality and relevance
 */
export function filterAndScoreArticles(articles, options = {}) {
  const {
    removeBlacklisted = true,
    prioritizeTrusted = true,
    filterNonUS = true,
    deduplicate = true,
    dedupeThreshold = 0.6,
  } = options;

  if (!articles || articles.length === 0) return [];

  let filtered = [...articles];

  // Remove blacklisted sources
  if (removeBlacklisted) {
    filtered = filtered.filter(article =>
      !isBlacklistedSource(article.source?.name, article.url)
    );
  }

  // Add region information to all articles
  filtered = filtered.map(article => {
    const regionInfo = detectArticleRegion(article);
    return {
      ...article,
      _regionInfo: regionInfo,
    };
  });

  // Filter out non-US articles (or move them to the end)
  if (filterNonUS) {
    const usArticles = filtered.filter(a => a._regionInfo.isUS);
    const nonUSArticles = filtered.filter(a => !a._regionInfo.isUS);
    // Keep some non-US articles at the end, but prioritize US
    filtered = [...usArticles, ...nonUSArticles.slice(0, 5)];
  }

  // Deduplicate
  if (deduplicate) {
    filtered = deduplicateArticles(filtered, dedupeThreshold);
  }

  // Score and sort articles
  if (prioritizeTrusted) {
    filtered = filtered.map(article => ({
      ...article,
      _score: calculateArticleScore(article),
    }));

    filtered.sort((a, b) => {
      // First by score, then by date
      if (b._score !== a._score) return b._score - a._score;
      return new Date(b.publishedAt) - new Date(a.publishedAt);
    });
  }

  return filtered;
}

/**
 * Calculate quality score for an article
 */
function calculateArticleScore(article) {
  let score = 0;

  // Trusted source bonus
  if (isTrustedSource(article.source?.name)) {
    score += 10;
  }

  // US market relevance bonus
  if (article._regionInfo?.isUS) {
    score += 5;
  }

  // Has image bonus (indicates quality)
  if (article.urlToImage) {
    score += 2;
  }

  // Has description bonus
  if (article.description && article.description.length > 50) {
    score += 2;
  }

  // Recency bonus (articles within last 24 hours)
  const hoursAgo = (Date.now() - new Date(article.publishedAt)) / (1000 * 60 * 60);
  if (hoursAgo < 24) {
    score += 3;
  } else if (hoursAgo < 48) {
    score += 1;
  }

  return score;
}

/**
 * Check if an article matches any watchlist ticker
 */
export function matchesWatchlist(article, watchlist, analyses = {}) {
  if (!article || !watchlist || watchlist.length === 0) return false;

  const title = (article.title || '').toUpperCase();
  const titleJa = (article.titleJa || '').toUpperCase();
  const description = (article.description || '').toUpperCase();
  const content = (article.content || '').toUpperCase();

  // Get analysis tickers if available
  const analysisTickers = analyses[article.url]?.tickers || [];

  return watchlist.some(ticker => {
    const symbol = ticker.symbol.toUpperCase();
    const name = (ticker.name || '').toUpperCase();

    // Extract key words from company name (remove Inc., Corp., etc.)
    const nameWords = name
      .replace(/\s*(inc\.?|corp\.?|corporation|company|co\.?|ltd\.?)\s*/gi, '')
      .trim();

    // Check various fields
    const checks = [
      // Direct ticker match (with word boundaries to avoid false positives)
      new RegExp(`\\b${symbol}\\b`, 'i').test(title),
      new RegExp(`\\b${symbol}\\b`, 'i').test(description),
      new RegExp(`\\$${symbol}\\b`, 'i').test(title),
      new RegExp(`\\$${symbol}\\b`, 'i').test(description),
      // Company name match
      title.includes(nameWords) && nameWords.length > 3,
      description.includes(nameWords) && nameWords.length > 3,
      titleJa.includes(symbol),
      // Content match (if available)
      new RegExp(`\\b${symbol}\\b`, 'i').test(content),
      // Analysis tickers match
      analysisTickers.some(t => t.toUpperCase() === symbol),
    ];

    return checks.some(Boolean);
  });
}

/**
 * Get region label for display
 */
export function getRegionLabel(article) {
  if (!article?._regionInfo?.label) return null;
  return article._regionInfo.label;
}
