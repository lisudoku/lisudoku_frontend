import React from 'react'
import ReactDOM from 'react-dom/client'
import axios from 'axios'
import './index.css'
import App from './App'
import { parseISO, differenceInDays } from 'date-fns'
import reportWebVitals from './reportWebVitals'
import { registerSW } from 'virtual:pwa-register'

if (import.meta.env.PROD) {
  console.log('lisudoku is open source! https://github.com/orgs/lisudoku/repositories')
  console.debug = () => {}
  console.log = () => {}
  console.info = () => {}
}

registerSW()

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
)
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

// Download puzzle data for offline play
// Should always hit the cache except when the cache expires
// Might be better with background operations, but whatever
// https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Offline_and_background_operation
// Only run this every 10 days
const LS_KEY = 'lisudokuLastDownload'
const lastDownloadStr = localStorage.getItem(LS_KEY)
if (!lastDownloadStr || differenceInDays(new Date(), parseISO(lastDownloadStr)) >= 10) {
  axios.post('/puzzles/download')
  localStorage.setItem(LS_KEY, new Date().toISOString())
}

// // If you want to start measuring performance in your app, pass a function
// // to log results (for example: reportWebVitals(console.log))
// // or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
