/* This ensures the manifest is properly precached */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("app-manifest").then(cache => {
      return cache.addAll([
        "/manifest.json",
        "/icons/icon-192x192.png",
        "/icons/icon-512x512.png",
        "/icons/compose-192x192.png",
        "/favicon.ico"
      ]);
    })
  );
});
