const API_BASE = '/api/news';

export async function fetchUSStockNews() {
  try {
    const response = await fetch(`${API_BASE}?type=stocks`);

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('APIリクエスト上限に達しました。しばらく待ってから再試行してください（無料プランは1日100回まで）');
      }
      throw new Error(`News API error: ${response.status}`);
    }

    const data = await response.json();
    return data.articles || [];
  } catch (error) {
    console.error('Failed to fetch news:', error);
    throw error;
  }
}

export async function fetchTopBusinessNews() {
  try {
    const response = await fetch(`${API_BASE}?type=headlines`);

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('APIリクエスト上限に達しました。しばらく待ってから再試行してください（無料プランは1日100回まで）');
      }
      throw new Error(`News API error: ${response.status}`);
    }

    const data = await response.json();
    return data.articles || [];
  } catch (error) {
    console.error('Failed to fetch top headlines:', error);
    throw error;
  }
}

export async function searchNews(query) {
  try {
    const response = await fetch(`${API_BASE}?type=search&query=${encodeURIComponent(query)}`);

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('APIリクエスト上限に達しました。しばらく待ってから再試行してください（無料プランは1日100回まで）');
      }
      throw new Error(`News API error: ${response.status}`);
    }

    const data = await response.json();
    return data.articles || [];
  } catch (error) {
    console.error('Failed to search news:', error);
    throw error;
  }
}

/**
 * Fetch news specifically related to watchlist tickers
 * @param {Array<{symbol: string, name: string}>} watchlist - Array of ticker objects
 * @returns {Promise<Array>} - Array of news articles
 */
export async function fetchWatchlistNews(watchlist) {
  if (!watchlist || watchlist.length === 0) {
    return [];
  }

  try {
    // Create a list of tickers and company names for the query
    const searchTerms = watchlist.flatMap(t => [
      t.symbol,
      // Extract main company name (without Inc., Corp., etc.)
      t.name?.replace(/\s*(Inc\.?|Corp\.?|Corporation|Company|Co\.?|Ltd\.?)\s*/gi, '').trim()
    ]).filter(Boolean);

    const tickersParam = searchTerms.join(',');
    const response = await fetch(`${API_BASE}?type=watchlist&tickers=${encodeURIComponent(tickersParam)}`);

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('APIリクエスト上限に達しました。しばらく待ってから再試行してください（無料プランは1日100回まで）');
      }
      throw new Error(`News API error: ${response.status}`);
    }

    const data = await response.json();
    return data.articles || [];
  } catch (error) {
    console.error('Failed to fetch watchlist news:', error);
    throw error;
  }
}
