export default async function handler(req, res) {
  const { type, query } = req.query;
  const apiKey = process.env.VITE_NEWS_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  let url;
  if (type === 'search' && query) {
    url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&sortBy=relevancy&pageSize=20&apiKey=${apiKey}`;
  } else if (type === 'stocks') {
    url = `https://newsapi.org/v2/everything?q=${encodeURIComponent('US stocks OR Wall Street OR NASDAQ OR S&P 500')}&language=en&sortBy=publishedAt&pageSize=20&apiKey=${apiKey}`;
  } else {
    url = `https://newsapi.org/v2/top-headlines?country=us&category=business&pageSize=20&apiKey=${apiKey}`;
  }

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
