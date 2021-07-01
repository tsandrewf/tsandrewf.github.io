"use strict";

// https://www.pwabuilder.com/publish
// https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Offline_Service_workers

const CACHE_NAME = "ariphmetic_tests_v_202107011322";

let cacheUrls = [
  "./",
  // HTML
  "./index.html",
  "./test3.html",
  "./1-20/index.html",
  "./1-100/index.html",
  // CSS
  "/css/materialIcons.css",
  "./css/index.css",
  "./css/problem_group.css",
  "./css/test3.css",
  // JS
  "./js/Clockface.js",
  "./js/getQueryVar.js",
  "./js/index.js",
  "./js/problem_group.js",
  "./js/test.js",
  "./js/test3.js",
  "./js/test3/1-20_AdjacentNumbers.js",
  "./js/test3/1-20_AddAndSub.js",
  "./js/test3/1-20_Comparison.js",
  "./js/test3/1-20_InsertNumber.js",
  "./js/test3/1-100_AdjacentNumbers.js",
  "./js/test3/1-100_AddAndSub.js",
  "./js/test3/1-100_Comparison.js",
  "./js/test3/1-100_InsertNumber.js",
  "./js/test3/1-100_TenAddAndSub.js",
  "./js/test3/Clockface2Time.js",
  "./js/test3/Division.js",
  "./js/test3/DivisionTable.js",
  "./js/test3/Multiplication.js",
  "./js/test3/MultiplicationTable.js",
  "./js/test3/Time2Clockface.js",
  "./js/test3/TimeText2Clockface.js",
  "./js/test3/TimeText2Time.js",
  "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js",
  "https://polyfill.io/v3/polyfill.min.js?features=es6",
  // PNG
  "./icons/ariphmetic_tests_32.png",
  "./icons/ariphmetic_tests_48.png",
  "./icons/ariphmetic_tests_64.png",
  "./icons/ariphmetic_tests_72.png",
  "./icons/ariphmetic_tests_96.png",
  "./icons/ariphmetic_tests_128.png",
  "./icons/ariphmetic_tests_192.png",
  "./icons/ariphmetic_tests_256.png",
  "./icons/ariphmetic_tests_512.png",
  // Fonts
  //"/fonts/MaterialIcons-Regular.woff",
  "/fonts/MaterialIcons-Regular.ttf",
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
