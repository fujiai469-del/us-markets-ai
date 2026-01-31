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

【関連銘柄(tickers)の選定ルール - 非常に重要】
- 記事の内容を注意深く読み、**その記事に直接関係する企業のみ**をティッカーシンボルで挙げてください
- 安易にGOOG、AAPL、MSFT、AMZN、NVDAなどの大手テック銘柄を入れないでください
- 記事内に具体的な企業名が言及されている場合、その企業のティッカーを優先してください
- 以下のような多様な銘柄から、記事内容に応じて適切なものを選んでください：
  * 金融：JPM、GS、BAC、C、MS、WFC、BLK、AXP
  * エネルギー：XOM、CVX、COP、SLB、OXY、EOG
  * ヘルスケア：JNJ、PFE、UNH、MRK、ABBV、LLY、BMY
  * 消費財：PG、KO、PEP、WMT、COST、TGT、NKE
  * 工業：CAT、BA、HON、GE、MMM、UPS、RTX
  * テック以外にも目を向けること
- 記事に関連企業の記載がない場合は、**空配列[]を返してください**（無理に埋めない）
- 最大5銘柄まで、本当に関連するものだけを選ぶ

【出力形式】JSON形式で回答してください（JSONのみ、他のテキストは不要）:
{
  "summary": "60〜120文字の日本語要約。具体的な数字・背景・影響を含めること",
  "impact": "投資家が取るべきアクションや注意点を50文字程度で説明",
  "importance": "高/中/低のいずれか",
  "sentiment": "positive/negative/neutralのいずれか（株価への影響がプラスならpositive、マイナスならnegative、どちらでもないならneutral）",
  "tickers": ["記事に直接関連する銘柄のみ（例: XOM, JPM, LLY）。なければ空配列[]を返す"]
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
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData?.error?.message || '';

      // レート制限・クオータ超過
      if (response.status === 429 || errorMessage.includes('quota') || errorMessage.includes('RATE_LIMIT')) {
        throw new Error('AI APIの利用上限に達しました。しばらく時間をおいてから再度お試しください。');
      }
      // 認証エラー
      if (response.status === 401 || response.status === 403) {
        throw new Error('AI APIへの認証に失敗しました。');
      }
      // サーバーエラー
      if (response.status >= 500) {
        throw new Error('AIサービスが一時的に利用できません。');
      }
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
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData?.error?.message || '';

      if (response.status === 429 || errorMessage.includes('quota') || errorMessage.includes('RATE_LIMIT')) {
        throw new Error('AI APIの利用上限に達しました。');
      }
      if (response.status === 401 || response.status === 403) {
        throw new Error('AI APIへの認証に失敗しました。');
      }
      if (response.status >= 500) {
        throw new Error('AIサービスが一時的に利用できません。');
      }
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
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData?.error?.message || '';

      if (response.status === 429 || errorMessage.includes('quota') || errorMessage.includes('RATE_LIMIT')) {
        throw new Error('AI APIの利用上限に達しました。');
      }
      if (response.status === 401 || response.status === 403) {
        throw new Error('AI APIへの認証に失敗しました。');
      }
      if (response.status >= 500) {
        throw new Error('AIサービスが一時的に利用できません。');
      }
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
