
const CACHE_NAME = "orcamento-marcenaria-v1";

const ARQUIVOS = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.json",
  "./img/%C3%8Dcone%20Minimalista%20de%20Marcenaria%20e%20C%C3%A1lculo.png"
];

// Guarda os arquivos do site para uso offline.
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ARQUIVOS);
    })
  );

  self.skipWaiting();
});

// Ativa o service worker.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((nomes) =>
      Promise.all(
        nomes
          .filter((nome) => nome.startsWith("orcamento-marcenaria-") && nome !== CACHE_NAME)
          .map((nome) => caches.delete(nome))
      )
    ).then(() => self.clients.claim())
  );
});

// Abre os arquivos guardados quando não há internet.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((resposta) => {
      if (resposta) return resposta;

      return fetch(event.request).catch(() => {
        if (event.request.mode === "navigate") {
          return caches.match("./index.html");
        }

        return new Response("", { status: 503 });
      });
    })
  );
});
