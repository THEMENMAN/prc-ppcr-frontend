// ============================================================
// PRC PPCR - Service Worker (v3.0.0 — force refresh)
// ============================================================

const CACHE_VERSION = 'v3.1.0'; // Change this from v3.0.0 to v3.1.0
const CACHE_NAME = `prc-ppcr-${CACHE_VERSION}`;

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/app.js',
  '/db.js',
  '/signature.js',
  '/pdf-export.js', 
  '/manifest.json',
];

// INSTALL
self.addEventListener('install', (event) => {
  console.log('🔧 SW installing v3.0.0');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('Pre-cache partial failure:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// ACTIVATE — delete ALL old caches
self.addEventListener('activate', (event) => {
  console.log('⚡ SW activating v3.0.0');
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('🗑️ Deleting old cache:', key);
            return caches.delete(key);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

// FETCH
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET
  if (request.method !== 'GET') return;

  // Skip browser extensions / non-http
  if (!url.protocol.startsWith('http')) return;

  // ============================================
  // SKIP admin dashboard
  // ============================================
  if (url.pathname.startsWith('/admin')) {
    return;
  }

  // ============================================
  // SKIP API — always hit network directly
  // ============================================
  if (url.pathname.startsWith('/api/')) {
    return; // Let browser handle natively
  }

  // ============================================
  // CDN scripts — cache-first
  // ============================================
  if (
    url.hostname.includes('cdn.tailwindcss.com') ||
    url.hostname.includes('cdnjs.cloudflare.com') ||
    url.hostname.includes('jsdelivr.net')
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // ============================================
  // App assets — network-first for JS (so updates always apply)
  // ============================================
  const isJS = url.pathname.endsWith('.js');
  const isHTML = url.pathname.endsWith('.html') || url.pathname === '/';

  if (isJS || isHTML) {
    event.respondWith(
      fetch(request).then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      }).catch(() => {
        return caches.match(request).then((cached) => {
          if (cached) return cached;
          if (request.mode === 'navigate') return caches.match('/index.html');
          return new Response('Offline', { status: 503 });
        });
      })
    );
    return;
  }

  // ============================================
  // Other assets — cache-first
  // ============================================
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      }).catch(() => {
        if (request.mode === 'navigate') return caches.match('/index.html');
        return new Response('Offline', { status: 503 });
      });
    })
  );
});

// BACKGROUND SYNC
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync:', event.tag);
  if (event.tag === 'sync-reports') {
    event.waitUntil(notifyClientsToSync());
  }
});

async function notifyClientsToSync() {
  const clients = await self.clients.matchAll({ includeUncontrolled: true });
  clients.forEach((client) => client.postMessage({ type: 'SYNC_NOW' }));
}

// MESSAGE
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('⚙️ Service Worker v3.0.0 loaded');