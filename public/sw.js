const CACHE_NAME = 'quietmind-cache-v1';

const PRECACHE_ASSETS = [
  './',
  './index.html'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
      })
    ))
  );
  self.clients.claim();
});

// Helper function to return range response from full cached Response
function returnRangeResponse(request, cachedResponse) {
  const rangeHeader = request.headers.get('range');
  if (!rangeHeader) {
    return cachedResponse;
  }

  return cachedResponse.arrayBuffer().then(arrayBuffer => {
    const bytes = rangeHeader.replace(/bytes=/, '').split('-');
    const start = parseInt(bytes[0], 10);
    const end = bytes[1] ? parseInt(bytes[1], 10) : arrayBuffer.byteLength - 1;

    const slicedBuffer = arrayBuffer.slice(start, end + 1);
    
    return new Response(slicedBuffer, {
      status: 206,
      statusText: 'Partial Content',
      headers: new Headers({
        'Content-Type': cachedResponse.headers.get('Content-Type') || 'audio/mp4',
        'Content-Range': `bytes ${start}-${end}/${arrayBuffer.byteLength}`,
        'Content-Length': slicedBuffer.byteLength.toString(),
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=31536000',
      })
    });
  });
}

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Check if this is an audio file request (e.g. assets/p/content/...)
  const isAudio = url.pathname.includes('/assets/p/content/') || url.pathname.endsWith('.mp4');

  if (isAudio) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache => {
        return cache.match(event.request.url).then(cachedResponse => {
          if (cachedResponse) {
            // Serve from cache, handling HTML5 range requests
            return returnRangeResponse(event.request, cachedResponse);
          }

          // Fetch from network, clone, and cache
          // Stripping Range headers gets the full file so we can cache it in one go.
          const cleanRequest = new Request(event.request.url, {
            method: 'GET',
            headers: new Headers(), // Strip range headers
            mode: 'cors',
            credentials: 'omit'
          });

          return fetch(cleanRequest).then(networkResponse => {
            if (networkResponse.status === 200) {
              cache.put(event.request.url, networkResponse.clone());
              return returnRangeResponse(event.request, networkResponse);
            }
            return networkResponse;
          });
        });
      })
    );
  } else {
    // Standard Cache-First/Stale-While-Revalidate strategy for other assets
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        if (cachedResponse) {
          // Fetch in background to update cache
          fetch(event.request).then(networkResponse => {
            if (networkResponse.status === 200) {
              caches.open(CACHE_NAME).then(cache => cache.put(event.request, networkResponse));
            }
          }).catch(() => {});
          return cachedResponse;
        }
        return fetch(event.request).then(networkResponse => {
          if (networkResponse.status === 200 && event.request.method === 'GET') {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return networkResponse;
        });
      })
    );
  }
});
