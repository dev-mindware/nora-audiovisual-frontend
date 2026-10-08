self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Apenas intercepta se houver necessidade real; trata erros graciosamente sem rejeitar a promise do FetchEvent
self.addEventListener("fetch", (event) => {
  // Let browser handle normal navigation and API calls natively
  if (event.request.method !== "GET" || event.request.url.includes("/api/")) {
    return;
  }

  // Fallback seguro que nunca deixa a promise de fetch rejeitada sem tratamento
  event.respondWith(
    fetch(event.request).catch((error) => {
      // Se a conexão falhar ou for abortada pelo Next.js router, não derruba o worker
      return new Response(null, {
        status: 504,
        statusText: "Gateway Timeout",
      });
    })
  );
});
