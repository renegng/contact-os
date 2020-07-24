// NOTE
// Even though this service worker is not on the root of this web application
// It has been configured, through swing_main.py to make it look like it is.

const filesToPreCache = [
    // Web pages
    { url: '/', revision: '2020-07-24-3' },
    { url: '/acercade/', revision: '2020-06-08-1' },
    { url: '/chat/', revision: '2020-07-24-3' },
    { url: '/login/', revision: '2020-07-09-1' },
    { url: '/politicaprivacidad/', revision: '2020-06-08-1' },
    { url: '/terminosdelservicio/', revision: '2020-06-08-1' },
    // Images
    { url: '/static/images/manifest/bid_slogan.png', revision: '2020-06-08-1' },
    { url: '/static/images/manifest/contact-os.svg', revision: '2020-06-08-1' },
    { url: '/static/images/manifest/icon-512x512.png', revision: '2020-06-08-1' },
    // Audio Files
    { url: '/static/media/audio/call_connected.mp3', revision: '2020-07-13-1' },
    { url: '/static/media/audio/call_ended.mp3', revision: '2020-07-13-1' },
    { url: '/static/media/audio/calling_ring.mp3', revision: '2020-07-09-1' }
];

// Importing Google's Workbox library for ServiceWorker implementation
importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.0.0/workbox-sw.js');

// Workbox Force Set Development/Production Builds 
// Development = debug: true 
// Production = debug: false
workbox.setConfig({ debug: false });

// Allows the ServiceWorker to update the app after user triggers refresh by updating it's lifecycle
workbox.core.skipWaiting();
workbox.core.clientsClaim();

// Configuring Workbox
workbox.core.setCacheNameDetails({
    prefix: 'contact-os',
    suffix: 'v2020-07-09-1',
    precache: 'pre-cache',
    runtime: 'run-time',
    googleAnalytics: 'ga',
});

// Install Event and Pre-Cache
workbox.precaching.precacheAndRoute(filesToPreCache);

// Enable Google Analytics Offline
workbox.googleAnalytics.initialize();

// Cache for Web Fonts.
workbox.routing.registerRoute(
    new RegExp(/.*(?:fonts\.googleapis|fonts\.gstatic|cloudflare)\.com/),
    new workbox.strategies.StaleWhileRevalidate({
        cacheName: 'contact-os-webfonts'
    }),
);

// Cache for CSS and JS
workbox.routing.registerRoute(
    new RegExp(/\.(?:js|css)$/),
    new workbox.strategies.StaleWhileRevalidate({
        cacheName: 'contact-os-css_js',
    })
);

// Cache for Images
workbox.routing.registerRoute(
    new RegExp('\.(?:png|gif|webp|jpg|jpeg|svg)$'),
    new workbox.strategies.StaleWhileRevalidate({
        cacheName: 'contact-os-img',
        plugins: [
            new workbox.expiration.ExpirationPlugin({
                // Keep at most 60 entries.
                maxEntries: 60,
                // Don't keep any entries for more than 30 days.
                maxAgeSeconds: 30 * 24 * 60 * 60,
                // Automatically cleanup if quota is exceeded.
                purgeOnQuotaError: true,
            }),
        ],
    }),
);

// // Push Messages
// self.addEventListener('push', event => {
//     var title = 'Yay a message.';
//     var body = 'We have received a push message.';
//     var icon = '/images/smiley.svg';
//     var tag = 'request';
//     event.waitUntil(
//         self.registration.showNotification(title, {
//             body: body,
//             icon: icon,
//             tag: tag
//         })
//     );
// });
