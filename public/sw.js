self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  // Do not intercept API requests or non-GET requests to prevent duplicate network roundtrips
  if (url.pathname.startsWith("/api") || event.request.method !== "GET") {
    return;
  }
  event.respondWith(fetch(event.request));
});
