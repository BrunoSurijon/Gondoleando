const CACHE_NAME = "gondoleando-cache-v1";
const urlsToCache = [
  "/index.html",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png"
];

// Instalar SW
self.addEventListener("install", (event) => {
  console.log("Service Worker intentando instalar...");
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      for (const url of urlsToCache) {
        try {
          await cache.add(url);
          console.log("Cacheado con éxito:", url);
        } catch (err) {
          console.error("Error cacheando:", url, err);
        }
      }
    })
  );
  self.skipWaiting();
});

// Activar SW
self.addEventListener("activate", (event) => {
  console.log("Service Worker activado");
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("Eliminando caché vieja:", cache);
            return caches.delete(cache);
          }
        })
      )
    )
  );
  self.clients.claim(); // Toma control de la página inmediatamente
});

// Interceptar solicitudes
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});