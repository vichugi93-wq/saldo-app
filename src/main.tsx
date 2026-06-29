import { ViteReactSSG } from 'vite-react-ssg';
import './index.css';
import { routes } from './routes';

export const createRoot = ViteReactSSG({ routes });

if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js');
  });
}
