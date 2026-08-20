const CACHE_NAME = "audioguide-v2";

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

const ALL_FILES = [...CORE_FILES, ...AUDIO_FILES];


// INSTALLATION : téléchargement de tout l'audioguide
self.addEventListener("install", event => {

    self.skipWaiting();

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ALL_FILES))
    );

});


// SUPPRESSION DES ANCIENS CACHES
self.addEventListener("activate", event => {

    event.waitUntil(
        caches.keys().then(cacheNames => {

            return Promise.all(
                cacheNames
                    .filter(name => name !== CACHE_NAME)
                    .map(name => caches.delete(name))
            );

        })
    );

    self.clients.claim();

});


// GESTION DES REQUÊTES
self.addEventListener("fetch", event => {

    const request = event.request;


    // CAS PARTICULIER : AUDIO AVEC REQUÊTE RANGE
    if (request.headers.has("range")) {

        event.respondWith(
            caches.match(request.url).then(async cachedResponse => {

                if (!cachedResponse) {
                    return fetch(request);
                }

                const buffer = await cachedResponse.arrayBuffer();

                const rangeHeader = request.headers.get("range");

                const parts = rangeHeader
                    .replace(/bytes=/, "")
                    .split("-");

                const start = parseInt(parts[0], 10);

                const end = parts[1]
                    ? parseInt(parts[1], 10)
                    : buffer.byteLength - 1;

                const slicedBuffer =
                    buffer.slice(start, end + 1);

                return new Response(slicedBuffer, {

                    status: 206,

                    statusText: "Partial Content",

                    headers: {
                        "Content-Type": "audio/mpeg",
                        "Content-Range":
                            `bytes ${start}-${end}/${buffer.byteLength}`,
                        "Accept-Ranges": "bytes",
                        "Content-Length":
                            slicedBuffer.byteLength
                    }

                });

            })
        );

        return;
    }


    // CAS NORMAL : HTML, images, etc.
    event.respondWith(

        caches.match(request).then(cachedResponse => {

            if (cachedResponse) {
                return cachedResponse;
            }

            return fetch(request).then(networkResponse => {

                const copy =
                    networkResponse.clone();

                caches.open(CACHE_NAME)
                    .then(cache => {
                        cache.put(request, copy);
                    });

                return networkResponse;

            });

        })

    );

});