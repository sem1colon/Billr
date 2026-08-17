// Service Worker registration for Progressive Web App (PWA) capabilities

export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const swUrl = `${import.meta.env.BASE_URL || './'}sw.js`.replace(/\/{2,}/g, '/');
      navigator.serviceWorker
        .register(swUrl)
        .then((registration) => {
          console.log('Billr PWA Service Worker registered with scope: ', registration.scope);
        })
        .catch((error) => {
          console.log('Billr PWA Service Worker registration failed: ', error);
        });
    });
  }
}

export function unregisterServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}
