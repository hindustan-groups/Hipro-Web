// Minimal service worker to enable PWA installability for HiPRO Vendor Portal
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
  // Network-first passthrough; no stale offline caching for authenticated portal APIs
});
