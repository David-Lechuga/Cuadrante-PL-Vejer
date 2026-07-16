const CACHE_NAME = "pl-vejer-v1";

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
        )
    );
});

self.addEventListener("fetch", event => {

    // Nunca cachear cuadrantes.json
    if (event.request.url.includes("cuadrantes.json")) {
        event.respondWith(
            fetch(event.request, {
                cache: "no-store"
            })
        );
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});