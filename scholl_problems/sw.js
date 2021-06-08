"use strict";

// https://www.pwabuilder.com/publish
// https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Offline_Service_workers

const CACHE_NAME = "scholl_problems_v_202106080904";

let cacheUrls = [
  "./",
  // HTML
  "./index.html",
  "./problem_with_decision.html",
  "./test1.html",
  "./class1/index.html",
  "./class2/index.html",
  "./class7/index.html",
  "./class7/20210424_qualifying_round/index.html",
  "./class7/20210424_qualifying_round/problem1.html",
  "./class7/20210424_qualifying_round/problem2.html",
  "./class7/20210424_qualifying_round/problem3.html",
  "./class7/20210424_qualifying_round/problem4.html",
  "./class7/20210424_qualifying_round/problem5.html",
  "./class7/20210424_qualifying_round/problem6.html",
  "./class7/20210424_qualifying_round/problem7.html",
  "./class7/20210424_qualifying_round/problem8.html",
  // CSS
  "./css/index.css",
  "./css/problem.css",
  "./css/problem_group.css",
  "./css/problem_with_decision.css",
  // JS
  "./js/getQueryVar.js",
  "./js/index.js",
  "./js/problem_group.js",
  "./js/problem_list.js",
  "./js/problem_with_decision.js",
  "./js/test1.js",
  "./class1/js/test1_1.js",
  "./class2/js/test1_1.js",
  "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js",
  "https://polyfill.io/v3/polyfill.min.js?features=es6",
  // PNG
  "./icons/scholl_problems32.png",
  "./icons/scholl_problems48.png",
  "./icons/scholl_problems64.png",
  "./icons/scholl_problems72.png",
  "./icons/scholl_problems96.png",
  "./icons/scholl_problems128.png",
  "./icons/scholl_problems192.png",
  "./icons/scholl_problems256.png",
  "./icons/scholl_problems512.png",
  // Fonts
  "/fonts/MaterialIcons-Regular.woff",
];

self.addEventListener("install", (e) => {
  console.log("[Service Worker] Install");
  e.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      console.log("[Service Worker] Caching all: app shell and content");
      await cache.addAll(cacheUrls);
    })()
  );
});

/*self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      Promise.all(
        keyList.map((key) => {
          if (key === CACHE_NAME) {
            return;
          }
          caches.delete(key);
        })
      );
    })()
  );
});*/
// https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Offline_Service_workers#Updates
self.addEventListener("activate", (e) => {
  console.log("[Service Worker] Activate");
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    (async () => {
      const r = await caches.match(e.request);
      //console.log(`[Service Worker] Fetching resource: ${e.request.url}`);
      if (r) {
        return r;
      }
      const response = await fetch(e.request);
      const cache = await caches.open(CACHE_NAME);
      console.log(`[Service Worker] Caching new resource: ${e.request.url}`);
      cache.put(e.request, response.clone());
      return response;
    })()
  );
});

self.addEventListener("message", (event) => {
  console.log("[Service Worker] message", event.data);
  if (event.data.serviceWorker === "skipWaiting") {
    skipWaiting().then(function () {
      console.log("[Service Worker] skipWaiting() OK!");
    });
  }
});
