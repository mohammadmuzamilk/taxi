import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Service Worker registration
// VitePWA handles SW generation automatically.
// The manual register below is a safety net for the custom /sw.js (e.g. push notifications).
// SKIP in dev: localhost HTTP is a secure context; self-signed SSL breaks SW registration.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('[Driver SW] Registered:', reg.scope);
        if (Notification.permission === 'default') {
          Notification.requestPermission();
        }
      })
      .catch((err) => console.error('[Driver SW] Registration failed:', err));
  });
}

