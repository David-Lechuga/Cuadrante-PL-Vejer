const CACHE_NAME = "pl-vejer-v2";

const STATIC_FILES = [
    "./",
    "./index.html",
    "./manifest.json",
    "./img/icono-192.png",
    "./img/icono-512.png"
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(STATIC_FILES))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.map(key => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            )
        ).then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", event => {

    // Nunca utilizar caché para cuadrantes.json
    if (event.request.url.includes("cuadrantes.json")) {
        event.respondWith(
            fetch(event.request, {
                cache: "no-store"
            })
        );
        return;
    }

    // Para HTML: siempre intentar obtener la versión actual
    if (event.request.mode === "navigate") {
        event.respondWith(
            fetch(event.request, {
                cache: "no-store"
            }).catch(() => {
                return caches.match("./index.html");
            })
        );
        return;
    }

    // Para el resto de recursos:
    // caché primero y red como alternativa
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});