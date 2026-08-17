import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerServiceWorker } from './serviceWorkerRegistration';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Register Service Worker for PWA offline capabilities and installability
registerServiceWorker();

// Developer signature
if (typeof window !== 'undefined') {
  console.log(
    '%csem1Colon Inc.%c Crafted with precision • https://sem1colon.github.io',
    'color: #2563eb; font-weight: bold; font-family: monospace; font-size: 12px;',
    'color: #64748b; font-size: 11px;'
  );
}

