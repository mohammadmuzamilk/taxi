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
// ─ In production: register /sw.js for offline caching and PWA install prompt.
// ─ In development: SKIP registration. localhost (plain HTTP) is already a
//   secure context, so Geolocation works. Registering an SW during dev causes
//   stale cache bugs and SSL errors when using basicSsl.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => console.log('[SW] Registered:', reg.scope))
      .catch((err) => console.error('[SW] Registration failed:', err));
  });
}

