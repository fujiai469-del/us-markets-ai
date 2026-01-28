# US Markets AI - トラブルシューティングガイド

## よくあるエラーと解決策

### 1. News API Error: 429 (Rate Limit)

#### 症状
- 画面に「エラー: News API error: 429」または「APIリクエスト上限に達しました」と表示される
- ニュースが読み込まれない

#### 原因
**NewsAPIの無料プランはレート制限があります：**
- 1日あたり **100リクエスト** まで
- 1リクエストあたり **最大100記事** まで
- 開発環境（localhost）でのみ使用可能

#### 解決策

**即時対処（待つ）:**
- 24時間後にリクエスト数がリセットされます
- UTC 00:00（日本時間 09:00）にリセット

**長期対策:**
1. **有料プランへのアップグレード**
   - Developer: $449/月（500リクエスト/日）
   - Business: 要問い合わせ
   - 詳細: https://newsapi.org/pricing

2. **キャッシュの活用**
   - 現在、サーバー側で5分間キャッシュを設定済み（`Cache-Control: s-maxage=300`）
   - ブラウザを頻繁にリロードしない

3. **代替APIの検討**
   - [Finnhub](https://finnhub.io/) - 無料枠あり
   - [Alpha Vantage](https://www.alphavantage.co/) - 株価・ニュースAPI
   - [Polygon.io](https://polygon.io/) - 金融データAPI

---

### 2. News API Error: 426 (Upgrade Required)

#### 症状
- 「News API error: 426」と表示される

#### 原因
無料プランでは使用できないパラメータを使用している：
- `domains` パラメータ
- `sources` パラメータ（/v2/everythingエンドポイント）

#### 解決策
`api/news.js` で `domains` や `sources` パラメータを削除し、サーバーサイドでフィルタリングを行う（現在の実装）。

---

### 3. News API Error: 401 (Unauthorized)

#### 症状
- 「News API error: 401」と表示される

#### 原因
- APIキーが設定されていない
- APIキーが無効または期限切れ

#### 解決策
1. `.env` ファイルを確認
   ```
   VITE_NEWS_API_KEY=your_actual_api_key_here
   ```

2. NewsAPIダッシュボードでAPIキーを確認
   - https://newsapi.org/account

3. Vercel環境変数を確認（本番環境の場合）
   - Vercel Dashboard → Settings → Environment Variables

---

### 4. 画面が白い / 何も表示されない

#### 考えられる原因
1. **JavaScriptエラー** - ブラウザのDevToolsでConsoleを確認
2. **APIキー未設定** - 上記401エラーを参照
3. **ネットワークエラー** - DevToolsのNetworkタブを確認

#### 解決策
1. ブラウザのDevTools（F12）を開く
2. Consoleタブでエラーを確認
3. Networkタブでリクエストの状態を確認

---

## APIリクエスト数の節約Tips

1. **開発中は頻繁にリロードしない**
   - 必要な時だけリフレッシュ

2. **キャッシュを活用**
   - 既にサーバー側で5分キャッシュ設定済み

3. **本番環境での無料プランは非推奨**
   - 無料プランはlocalhostでのみ動作
   - 本番デプロイには有料プランが必要

---

## 環境変数一覧

| 変数名 | 説明 | 取得場所 |
|--------|------|----------|
| `VITE_NEWS_API_KEY` | NewsAPI APIキー | https://newsapi.org/account |
| `VITE_GEMINI_API_KEY` | Gemini AI APIキー | https://aistudio.google.com/apikey |

---

## お問い合わせ

問題が解決しない場合は、以下の情報を添えてお問い合わせください：
- エラーメッセージの全文
- ブラウザのDevTools Console/Networkタブのスクリーンショット
- 発生した日時
