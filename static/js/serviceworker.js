// NOTE
// Even though this service worker is not on the root of this web application
// It has been configured, through swing_main.py to make it look like it is.

import 'core-js';
import 'regenerator-runtime/runtime';
import * as localForage from "localforage";
import * as googleAnalytics from 'workbox-google-analytics';
import { cacheNames, clientsClaim, setCacheNameDetails } from 'workbox-core';
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { googleFontsCache, imageCache, offlineFallback, pageCache, staticResourceCache } from 'workbox-recipes';

// Create a localForage Instance
const swStore = localForage.createInstance({
    name: 'swingcms-sw'
});

// URLs to Pre-Cache
const filesToPreCache = [
    // Web pages
    { url: '/', revision: '2021-09-02-1' },
    { url: '/offline/', revision: '2021-09-02-1' },
    { url: '/politicaprivacidad/', revision: '2021-09-02-1' },
    { url: '/terminosdelservicio/', revision: '2021-09-02-1' },
    // Images
    { url: '/static/images/manifest/agent_f.svg', revision: '2021-09-02-1' },
    { url: '/static/images/manifest/bid_slogan.png', revision: '2021-09-02-1' },
    { url: '/static/images/manifest/contact-os.svg', revision: '2021-09-02-1' },
    { url: '/static/images/manifest/icon-512x512.png', revision: '2021-09-02-1' },
    { url: '/static/images/manifest/user_f.svg', revision: '2021-09-02-1' },
    { url: '/static/images/manifest/wifi_antenna.svg', revision: '2021-09-02-1' },
    // Audio Files
    { url: '/static/media/audio/call_connected.mp3', revision: '2021-09-02-1' },
    { url: '/static/media/audio/call_ended.mp3', revision: '2021-09-02-1' },
    { url: '/static/media/audio/calling_ring.mp3', revision: '2021-09-02-1' },
    { url: '/static/media/audio/msg_chat_bg.mp3', revision: '2021-09-02-1' },
    { url: '/static/media/audio/msg_chat_new.mp3', revision: '2021-09-02-1' },
    { url: '/static/media/audio/msg_chat_pop.mp3', revision: '2021-09-02-1' },
    { url: '/static/media/audio/msg_chat_tr.mp3', revision: '2021-09-02-1' },
    { url: '/static/media/audio/notification_new.mp3', revision: '2021-09-02-1' }
];

// Configuring Workbox
setCacheNameDetails({
    prefix: 'contact-os',
    suffix: 'v2021-09-02-1',
    precache: 'install-time',
    runtime: 'run-time',
    googleAnalytics: 'ga'
});
// Set Cache Names
const cacheNameGoogleFonts = cacheNames.prefix + '-' + cacheNames.suffix;
const cacheNameImages = cacheNames.prefix + '-img-' + cacheNames.suffix;
const cacheNameOffline = 'workbox-offline-fallbacks';
const cacheNamePages = cacheNames.prefix + '-pages-' + cacheNames.suffix;
const cacheNameStatic = cacheNames.prefix + '-css_js-' + cacheNames.suffix;

// Allows the ServiceWorker to update the app after user triggers refresh by updating it's lifecycle &
// Control already-open web pages as soon as soon as it activates
self.skipWaiting();
clientsClaim();

// Activate Event and Delete Old Caches
cleanupOutdatedCaches();
self.addEventListener('activate', event => {
    const promiseChain = caches.keys().then((browserCaches) => {
        // Get all valid caches
        let validCacheSet = new Set();
        validCacheSet.add(cacheNames.googleAnalytics);
        validCacheSet.add(cacheNames.precache);
        validCacheSet.add(cacheNames.runtime);
        validCacheSet.add(cacheNameGoogleFonts + '-webfonts');
        validCacheSet.add(cacheNameStatic);
        validCacheSet.add(cacheNamePages);
        validCacheSet.add(cacheNameImages);
        validCacheSet.add(cacheNameOffline);

        return Promise.all(
            browserCaches.filter((browserCache) => {
                return !validCacheSet.has(browserCache);
            }).map((browserCache) => {
                console.log("Deleting Cache: ", browserCache);
                caches.delete(browserCache);
            })
        );
    });
    // Keep the service worker alive until all caches are deleted.
    event.waitUntil(promiseChain);
});

// Enable Google Analytics Offline
googleAnalytics.initialize();

// Install Event and Pre-Cache
precacheAndRoute(filesToPreCache);
googleFontsCache({'cachePrefix': cacheNameGoogleFonts});
imageCache({'cacheName': cacheNameImages});
pageCache({'cacheName': cacheNamePages});
staticResourceCache({'cacheName': cacheNameStatic});
offlineFallback({'pageFallback': '/offline/'});

// Store Service Worker current version in localForage
swStore.setItem('swVersion', cacheNames.suffix).then( (val) => {
    console.log('Service Worker version: ' + val);
});

