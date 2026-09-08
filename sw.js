/* R3IGN ESPORTS — Service Worker */
const CACHE_NAME = "r3ign-v3";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/css/styles.css",
  "/js/main.js",
  "/js/auth.js",
  "/js/supabase-config.js",
  "/js/assistant.js",
  "/assets/favicon.png",
  "/assets/r3ign-logo-256.jpg",
  "/assets/r3ign-logo.jpg",
  "/assets/mark.svg"
];

// Install: cache core assets
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate: clean old caches
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: keep app assets fresh so config/auth updates aren't stuck behind stale cache entries.
self.addEventListener("fetch", (e) => {
  const { request } = e;
  const url = new URL(request.url);

  // Skip non-GET requests and Supabase API calls.
  if (request.method !== "GET") return;
  if (url.hostname.includes("supabase.co")) return;

  // Always prefer the current server version for generated auth/config files.
  if (
    url.pathname.endsWith("/js/supabase-config.js") ||
    url.pathname.endsWith("/js/auth.js") ||
    url.pathname.endsWith("/js/main.js") ||
    url.pathname.endsWith("/js/assistant.js")
  ) {
    e.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // For HTML/CSS/image files, update the cache on successful fetch but prefer a fresh response.
  if (
    url.pathname.endsWith(".html") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".jpg") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".woff2")
  ) {
    e.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Network-first for everything else.
  e.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});
