const API_BASE = '/api/news';

export async function fetchUSStockNews() {
  try {
    const response = await fetch(`${API_BASE}?type=stocks`);

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
    const response = await fetch(`${API_BASE}?type=headlines`);

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
    const response = await fetch(`${API_BASE}?type=search&query=${encodeURIComponent(query)}`);

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
