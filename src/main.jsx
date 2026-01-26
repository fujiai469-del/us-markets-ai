import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.jsx'

// Service Workerの登録（手動更新モード）
const updateSW = registerSW({
  onNeedRefresh() {
    // 更新が利用可能な時、確認ダイアログを表示
    if (confirm('新しいバージョンがあります。更新しますか？')) {
      updateSW(true)
    }
  },
  onOfflineReady() {
    console.log('オフラインで利用可能です')
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
