const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY;
const BASE_URL = 'https://newsapi.org/v2';

export async function fetchUSStockNews(query = 'US stocks OR Wall Street OR NASDAQ OR S&P 500') {
  try {
    const response = await fetch(
      `${BASE_URL}/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&pageSize=20&apiKey=${NEWS_API_KEY}`
    );

    if (!response.ok) {
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
    const response = await fetch(
      `${BASE_URL}/top-headlines?country=us&category=business&pageSize=20&apiKey=${NEWS_API_KEY}`
    );

    if (!response.ok) {
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
    const response = await fetch(
      `${BASE_URL}/everything?q=${encodeURIComponent(query)}&language=en&sortBy=relevancy&pageSize=20&apiKey=${NEWS_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`News API error: ${response.status}`);
    }

    const data = await response.json();
    return data.articles || [];
  } catch (error) {
    console.error('Failed to search news:', error);
    throw error;
  }
}
