import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Prevent multi-finger pinch-to-zoom on mobile devices while maintaining standard single-finger scrolling
if (typeof window !== 'undefined') {
  document.addEventListener(
    'touchmove',
    (e: TouchEvent) => {
      if (e.touches && e.touches.length > 1) {
        e.preventDefault();
      }
    },
    { passive: false }
  );

  document.addEventListener('gesturestart', (e: Event) => e.preventDefault(), { passive: false });
  document.addEventListener('gesturechange', (e: Event) => e.preventDefault(), { passive: false });
  document.addEventListener('gestureend', (e: Event) => e.preventDefault(), { passive: false });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
