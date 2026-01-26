import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// まずアプリをレンダリング
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// アプリがレンダリングされた後にService Workerを登録
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const { registerSW } = await import('virtual:pwa-register')

      const updateSW = registerSW({
        immediate: false,
        onNeedRefresh() {
          // 画面下部に更新バナーを表示
          const banner = document.createElement('div')
          banner.id = 'update-banner'
          banner.innerHTML = `
            <div style="position:fixed;bottom:80px;left:16px;right:16px;background:#1e40af;color:white;padding:16px;border-radius:12px;display:flex;justify-content:space-between;align-items:center;z-index:9999;box-shadow:0 4px 12px rgba(0,0,0,0.3);">
              <span style="font-size:14px;">新しいバージョンがあります</span>
              <button id="update-btn" style="background:white;color:#1e40af;border:none;padding:8px 16px;border-radius:8px;font-weight:bold;cursor:pointer;">更新</button>
            </div>
          `
          document.body.appendChild(banner)

          document.getElementById('update-btn').addEventListener('click', () => {
            updateSW(true)
          })
        },
        onOfflineReady() {
          console.log('オフラインで利用可能です')
        },
        onRegisteredSW(swUrl, r) {
          // 定期的に更新をチェックしない（手動更新のみ）
          console.log('Service Worker registered:', swUrl)
        },
      })
    } catch (e) {
      console.log('PWA registration skipped:', e)
    }
  })
}
