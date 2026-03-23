import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) || 'https://cake-ylmo.onrender.com'

declare global {
  interface Window {
    __apiFetchPatched?: boolean
  }
}

if (typeof window !== 'undefined' && !window.__apiFetchPatched) {
  const originalFetch = window.fetch.bind(window)
  window.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
    if (typeof input === 'string' && input.startsWith('/api/')) {
      return originalFetch(`${API_BASE}${input}`, init)
    }
    if (input instanceof URL && input.pathname.startsWith('/api/')) {
      return originalFetch(new URL(`${API_BASE}${input.pathname}${input.search}`), init)
    }
    return originalFetch(input as any, init)
  }) as typeof window.fetch

  window.__apiFetchPatched = true
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)

