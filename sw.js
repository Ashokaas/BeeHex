self.addEventListener('fetch', event => {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
          const networkFetch = fetch(event.request).then(response => {
            // update the cache with a clone of the network response
            const responseClone = response.clone()
            caches.open("app-cache").then(cache => {
              cache.put(event.request, responseClone)
            })
            return response
          }).catch(function (reason) {
            console.error('ServiceWorker fetch failed: ', reason)
          })
          // prioritize cached response over network
          return cachedResponse || networkFetch
        }
      )
    )
  })