export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator && (import.meta.env.PROD || import.meta.env.MODE === 'production')) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('TradeTale PWA Service Worker registered successfully:', registration.scope);
        })
        .catch((error) => {
          console.warn('PWA Service Worker registration failed:', error);
        });
    });
  }
}
