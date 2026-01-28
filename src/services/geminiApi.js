const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export async function analyzeNewsArticle(article) {
  try {
    const prompt = `あなたは米国株投資家向けの金融アナリストです。以下のニュース記事を分析し、投資判断に役立つ具体的な情報を抽出してください。

【記事情報】
タイトル: ${article.title}
概要: ${article.description || '概要なし'}
ソース: ${article.source?.name || '不明'}

【重要な指示】
- summaryは「タイトルの言い換え」ではなく、記事の中身から得られる**具体的な情報**を記載すること
- 以下の要素を可能な限り含めること：
  * 具体的な数字（株価変動率、売上高、予測数値、金額など）
  * ニュースの背景や原因（なぜこのニュースが発生したのか）
  * 今後の市場・株価への具体的な影響や懸念点
- 抽象的な表現（「市場に影響がある」「注目される」など）だけで終わらせない
- タイトルをそのまま繰り返すことは禁止

【出力形式】JSON形式で回答してください（JSONのみ、他のテキストは不要）:
{
  "summary": "60〜120文字の日本語要約。具体的な数字・背景・影響を含めること",
  "impact": "投資家が取るべきアクションや注意点を50文字程度で説明",
  "importance": "高/中/低のいずれか",
  "sentiment": "positive/negative/neutralのいずれか（株価への影響がプラスならpositive、マイナスならnegative、どちらでもないならneutral）",
  "tickers": ["記事に関連する銘柄のティッカーシンボル（例: AAPL, TSLA, NVDA）を配列で。なければ空配列"]
}

【良い要約の例】
タイトル：「NVIDIAの株価が急落」
良い要約：「米国による新たな輸出規制への懸念から前日比-5%の大幅下落。アナリストは短期的な収益への影響は限定的とするものの、中国市場での売上減少リスクが指摘されている。」`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error('No response from Gemini');
    }

    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response');
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Failed to analyze article:', error);
    throw error;
  }
}

export async function translateArticles(articles) {
  try {
    const titlesToTranslate = articles.map((a, i) => `${i + 1}. ${a.title}`).join('\n');

    const prompt = `以下のニュースタイトルを日本語に翻訳してください。番号と対応する翻訳のみをJSON配列で返してください。

${titlesToTranslate}

以下の形式でJSON配列で回答してください（JSONのみ、他のテキストは不要）:
["翻訳1", "翻訳2", "翻訳3", ...]`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 2000,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error('No response from Gemini');
    }

    // Extract JSON array from the response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response');
    }

    const translations = JSON.parse(jsonMatch[0]);

    // Map translations to articles
    return articles.map((article, index) => ({
      ...article,
      titleJa: translations[index] || article.title,
    }));
  } catch (error) {
    console.error('Failed to translate articles:', error);
    // Return original articles if translation fails
    return articles;
  }
}

export async function batchAnalyzeNews(articles) {
  const results = [];
  for (const article of articles.slice(0, 5)) {
    try {
      const analysis = await analyzeNewsArticle(article);
      results.push({ article, analysis });
    } catch (error) {
      results.push({ article, analysis: null, error: error.message });
    }
    // Rate limiting
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  return results;
}

const CATEGORIES = ['経済', '国際情勢', 'テクノロジー', '企業決算', '金融政策', 'その他'];

export async function categorizeArticles(articles) {
  try {
    const articleList = articles.map((a, i) => `${i + 1}. ${a.title}`).join('\n');

    const prompt = `以下のニュースタイトルをカテゴリーに分類してください。

カテゴリー一覧:
- 経済: GDP、雇用統計、消費者物価、景気動向など
- 国際情勢: 地政学、貿易摩擦、外交、戦争・紛争など
- テクノロジー: AI、半導体、ソフトウェア、イノベーションなど
- 企業決算: 四半期決算、業績予想、M&Aなど
- 金融政策: FRB、金利、量的緩和、中央銀行など
- その他: 上記に当てはまらないもの

ニュース一覧:
${articleList}

各ニュースに対応するカテゴリーをJSON配列で返してください（カテゴリー名のみ）:
["経済", "テクノロジー", "国際情勢", ...]`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1000,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error('No response from Gemini');
    }

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response');
    }

    const categories = JSON.parse(jsonMatch[0]);

    return articles.map((article, index) => ({
      ...article,
      category: categories[index] || 'その他',
    }));
  } catch (error) {
    console.error('Failed to categorize articles:', error);
    return articles.map(article => ({ ...article, category: 'その他' }));
  }
}

export { CATEGORIES };
