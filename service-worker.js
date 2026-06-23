/* =====================================================================
   KLN · Inspección Liverpool — Service Worker
   Cachea la app para que abra sin internet (el ENVÍO sí requiere red).
   Sube la versión (CACHE) cada vez que cambies archivos para forzar
   actualización en los iPhone ya instalados.
   ===================================================================== */
const CACHE = "kln-liverpool-v15";

const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./config.js",
  "./manifest.json",
  "./logo.jpg",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
];

/* Instalar: precachear la app */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

/* Activar: borrar caches viejos */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

/* Fetch:
   - Peticiones al Apps Script (POST / cross-origin): siempre a la red.
   - Navegación y assets propios: cache-first con respaldo a red. */
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // No interceptamos envíos al backend ni nada que no sea GET
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) {
    return; // deja pasar a la red normalmente
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match("./index.html"));
    })
  );
});
