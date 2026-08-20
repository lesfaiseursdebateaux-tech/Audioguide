const CACHE_NAME = "audioguide-v1";

const CORE_FILES = [
  "./",
  "./index.html",
  "./anglais.html",
  "./neerlandais.html",
  "./allemand.html",
  "./espagnol.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

const AUDIO_FILES = [
  "./anglais/01.mp3",
  "./anglais/02.mp3",
  "./anglais/03.mp3",
  "./anglais/04.mp3",
  "./anglais/05.mp3",
  "./anglais/06.mp3",
  "./anglais/07.mp3",
  "./anglais/08.mp3",
  "./neerlandais/01.mp3",
  "./neerlandais/02.mp3",
  "./neerlandais/03.mp3",
  "./neerlandais/04.mp3",
  "./neerlandais/05.mp3",
  "./neerlandais/06.mp3",
  "./neerlandais/07.mp3",
  "./neerlandais/08.mp3",
  "./allemand/01.mp3",
  "./allemand/02.mp3",
  "./allemand/03.mp3",
  "./allemand/04.mp3",
  "./allemand/05.mp3",
  "./allemand/06.mp3",
  "./allemand/07.mp3",
  "./allemand/08.mp3",
  "./espagnol/01.mp3",
  "./espagnol/02.mp3",
  "./espagnol/03.mp3",
  "./espagnol/04.mp3",
  "./espagnol/05.mp3",
  "./espagnol/06.mp3",
  "./espagnol/07.mp3",
  "./espagnol/08.mp3"
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(async cache => {
            await cache.addAll(CORE_FILES);

            // Les fichiers audio sont mis en cache un par un.
            // Si un MP3 manque, l'installation de la PWA ne plante pas.
            await Promise.allSettled(
                AUDIO_FILES.map(file => cache.add(file))
            );
        })
    );
    self.skipWaiting();
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            )
        )
    );
    self.clients.claim();
});

self.addEventListener("fetch", event => {
    if (event.request.method !== "GET") return;

    event.respondWith(
        caches.match(event.request).then(cached => {
            if (cached) return cached;

            return fetch(event.request).then(response => {
                const copy = response.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
                return response;
            });
        })
    );
});
