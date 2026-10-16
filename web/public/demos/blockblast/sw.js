// Service worker: caches the app shell so the game plays offline.
//
// `just build-web` (scripts/stamp-build.py) replaces 4b770dff6f101973 with a
// hash of the shell, and puts the same version in the names of the glue
// script and the wasm. Every build that changes the shell therefore gets a
// byte-different worker, which the browser installs: it precaches the new
// build under a new cache name, takes over, and deletes the old caches.
"use strict";

const CACHE_PREFIX = "blockblast-";
const CACHE = `${CACHE_PREFIX}4b770dff6f101973`;
const SHELL = [
  "./",
  "index.html",
  "loader.js",
  "blockblast-web.4b770dff6f101973.js",
  "blockblast_web.4b770dff6f101973.wasm",
  "manifest.webmanifest",
  "icon-192.png",
  "icon-512.png",
  "maskable-192.png",
  "maskable-512.png",
  "OFL.txt",
];

self.addEventListener("install", (event) => {
  // Bypass the HTTP cache: it may still hold the previous build's
  // index.html and loader.js, which must not be cached as this build's.
  const requests = SHELL.map((url) => new Request(url, { cache: "reload" }));
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(requests))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(
          names
            .filter((name) => name.startsWith(CACHE_PREFIX) && name !== CACHE)
            .map((name) => caches.delete(name)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// A copy of a response that followed redirects, without the redirect flag.
// Hosts like Cloudflare Pages redirect index.html to ./, so the precached
// index.html is a redirected response, and the browser rejects one of those
// as the answer to a navigation ("response served by service worker has
// redirections"). Added by the resume, not part of the BlockBlast build
// (see web/README.md).
function unredirected(response) {
  if (!response.redirected) {
    return response;
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
}

// Cache first for this origin's GETs: the shell only changes with a new
// build, which comes with a new worker. The query is ignored, so /?seed=42
// is served by "./". Anything else goes to the network untouched.
self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) {
    return;
  }
  event.respondWith(
    caches
      .open(CACHE)
      .then((cache) => cache.match(request, { ignoreSearch: true }))
      .then((cached) => (cached ? unredirected(cached) : fetch(request))),
  );
});
