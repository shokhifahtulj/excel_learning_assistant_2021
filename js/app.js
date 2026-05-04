// js/app.js

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Resolve path to sw.js based on current location
        let swPath = './sw.js';
        if (window.location.pathname.includes('/pages/')) {
            swPath = '../sw.js';
        }
        
        navigator.serviceWorker.register(swPath)
            .then(registration => {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            })
            .catch(error => {
                console.log('ServiceWorker registration failed: ', error);
            });
    });
}
