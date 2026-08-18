// Kill-switch service worker.
//
// The web build moved to `--pwa-strategy none`, so Flutter no longer generates
// a service worker. Clients who visited before that change still have the old
// offline-first worker registered, and it will not remove itself: hosting
// rewrites `**` to /index.html, so a request for a missing worker script comes
// back as HTML with a 200 and the browser's update check fails on MIME type,
// leaving the stale worker serving a stale bundle forever.
//
// This file keeps that path alive with a worker whose only job is to uninstall
// the previous one, drop its caches, and reload open tabs onto the live build.
// Do not delete it until analytics show no clients on pre-2026-08 builds.

self.addEventListener("install", () => {
  // Skip the "waiting" state — the old worker is exactly what we are removing.
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
      } catch (error) {
        // Keep going — unregistering matters more than a clean cache sweep.
        console.warn("Cache purge failed:", error);
      }

      await self.registration.unregister();

      const clients = await self.clients.matchAll({ type: "window" });
      for (const client of clients) {
        client.navigate(client.url);
      }
    })(),
  );
});

// Pass every request straight to the network. Between activate and the reload
// above there is a short window where this worker still controls the page.
self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});
