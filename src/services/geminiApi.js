const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export async function analyzeNewsArticle(article) {
  try {
    const prompt = `以下のニュース記事を分析し、米国株投資家向けに要約してください。

タイトル: ${article.title}
概要: ${article.description || '概要なし'}
ソース: ${article.source?.name || '不明'}

以下の形式でJSON形式で回答してください（JSONのみ、他のテキストは不要）:
{
  "summary": "50〜100文字程度の日本語要約",
  "impact": "投資への影響を50文字程度で説明",
  "importance": "高/中/低のいずれか"
}`;

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
