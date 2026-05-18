/**
 * Àmì by Kòkò — Service Worker
 * Caches app pages, audio files, and illustrations for offline use.
 */

const CACHE_NAME = "ami-koko-v1";
const AUDIO_CACHE = "ami-koko-audio-v1";

// Pages to cache on install
const PRECACHE_PAGES = [
  "/",
  "/home",
  "/phonics",
  "/phonics/english",
  "/numeracy",
  "/numeracy/english",
  "/world",
  "/story",
  "/dj-booth",
  "/settings",
  "/offline.html",
];

// Static assets to cache on install
const PRECACHE_ASSETS = [
  "/ami-koko.svg",
  "/favicon.svg",
  "/manifest.json",
];

// ─── Install ──────────────────────────────────────────────────────────────────

self.addEventListener("install", (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then((cache) =>
        cache.addAll([...PRECACHE_PAGES, ...PRECACHE_ASSETS].map(url => {
          return new Request(url, { cache: "reload" });
        })).catch(() => {
          // Some pages may not be available at install time — that's fine
        })
      ),
    ])
  );
  self.skipWaiting();
});

// ─── Activate ─────────────────────────────────────────────────────────────────

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME && k !== AUDIO_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ─── Fetch ────────────────────────────────────────────────────────────────────

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and Supabase API calls (can't cache auth)
  if (request.method !== "GET") return;
  if (url.hostname.includes("supabase.co")) return;
  if (url.pathname.startsWith("/api/")) return;

  // Audio files — cache first (they never change)
  if (url.pathname.startsWith("/audio/")) {
    event.respondWith(
      caches.open(AUDIO_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        try {
          const response = await fetch(request);
          if (response.ok) cache.put(request, response.clone());
          return response;
        } catch {
          return new Response("", { status: 404 });
        }
      })
    );
    return;
  }

  // Pages and assets — network first, cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        // For navigation requests, show offline page
        if (request.mode === "navigate") {
          const offline = await caches.match("/offline.html");
          if (offline) return offline;
        }
        return new Response("Offline", { status: 503 });
      })
  );
});
