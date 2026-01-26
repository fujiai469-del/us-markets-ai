export default async function handler(req, res) {
  const { type, query } = req.query;
  const apiKey = process.env.VITE_NEWS_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  let url;
  if (type === 'search' && query) {
    // 検索時は株・金融関連に絞る
    url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query + ' AND (stock OR market OR trading OR investor)')}&language=en&sortBy=relevancy&pageSize=20&apiKey=${apiKey}`;
  } else if (type === 'stocks') {
    // 米国株・金融に特化したキーワード
    const stockQuery = '(NYSE OR NASDAQ OR "S&P 500" OR Dow OR earnings OR "stock market" OR "Fed rate" OR Treasury OR "Wall Street") AND (stock OR shares OR trading OR investor OR market)';
    url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(stockQuery)}&language=en&sortBy=publishedAt&pageSize=25&apiKey=${apiKey}`;
  } else {
    // ビジネストップニュース
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
