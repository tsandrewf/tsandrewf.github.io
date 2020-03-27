"use strict";

const CACHE_NAME = "outlay_v_202003271316";

let cacheUrls = [
  // HTML
  "./outlay.html",
  // CSS
  "./base.css",
  "./button.css",
  "./content.css",
  "./menuDropdown.css",
  "./navbar.css",
  "./outlayCategory.css",
  "./outlayCategoryEdit.css",
  "./outlayEntries.css",
  "./outlayEntryEdit.css",
  "./outlaySummary.css",
  "./outlayUtils.css",
  "./standbyIndicator.css",
  "./tableBase.css",
  "./category.js",
  // JS
  //"./category.js",
  "./date.js",
  "./db.js",
  "./navbarBottom.js",
  "./navbarTop.js",
  "./outlay.js",
  "./outlayCategory.js",
  "./outlayCategoryEdit.js",
  "./outlayEntries.js",
  "./outlayEntry.js",
  "./outlayEntryEdit.js",
  "./outlaySummary.js",
  "./outlayUtils.js",
  "./setting.js",
  "./standbyIndicator.js",
  "./url.js",
  // PNG
  "./icons/outlay32.png",
  "./icons/outlay256.png"
];

self.addEventListener("message", async function(event) {
  console.log('Service worker received event "' + event.data + '"');

  if ("outlay.html_onload" === event.data) {
    const cache = await caches.open(CACHE_NAME);
    let cacheChanges = [];
    for (let request of await cache.keys()) {
      const responseCached = await cache.match(request);
      request.headers.set("etag", responseCached.headers.get("etag"));
      request.headers.set(
        "last-modified",
        responseCached.headers.get("last-modified")
      );
      try {
        const response = await fetch(request);
        if (
          response.headers.get("etag") !== request.headers.get("etag") ||
          response.headers.get("last-modified") !==
            request.headers.get("last-modified")
        ) {
          console.log("------------------------------------------------------");
          console.log('New file "' + request.url + '"');
          if (response.headers.get("etag") !== request.headers.get("etag")) {
            console.log(
              'Request etag "' +
                request.headers.get("etag") +
                '" differs from response etag "' +
                response.headers.get("etag") +
                '"'
            );
          }
          if (
            response.headers.get("last-modified") !==
            request.headers.get("last-modified")
          ) {
            console.log(
              'Request last-modified "' +
                request.headers.get("last-modified") +
                '" differs from response last-modified "' +
                response.headers.get("last-modified") +
                '"'
            );
          }
          cacheChanges.push({ request: request, response: response.clone() });
        }
      } catch (error) {
        console.log('Error fetch "' + request.url + '": ' + error);
        return;
      }
    }

    for (let cacheChange of cacheChanges) {
      if (cacheChange.response.ok) {
        cache.put(cacheChange.request, cacheChange.response);
        console.log('Cached request "' + cacheChange.request.url + '"');
        console.log('Cached response "' + cacheChange.response.url + '"');
      } else {
        cache.delete(cacheChange.request);
        console.log(
          'Deleted response "' + cacheChange.request.url + '" from cache'
        );
      }
    }
  }
});

self.addEventListener("install", function(event) {
  //console.log("Service Worker Install", event);
  //self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(cacheUrls);
    })
  );
});

// https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Offline_Service_workers#Updates
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(
        keyList.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});

/*self.addEventListener("fetch", function(event) {
  console.log("Service Worker Fetch", event);
  event.respondWith(
    fetch(event.request).catch(function() {
      console.log("catch fetch");
      caches
        .match(event.request)
        .then(function(response) {
          console.log("caches match", response);
          return response;
        })
        .catch(function(error) {
          console.log("caches catch", error);
        });
    })
  );
});*/
/*self.addEventListener("fetch", function(event) {
  console.log("Service Worker Fetch", event);
  event.respondWith(async () => {
    const response = await fetch(event.request);
    //return response;
  });
});*/
/*self.addEventListener("fetch", function(event) {
  event.respondWith(
    fetch(event.request).catch(function() {
      console.log("fetch catch", event.request);
      caches.match(event.request).then(function(response) {
        console.log("caches match", response);
        console.log("response.body", response.body);
        return response;
      });
    })
  );
});*/
// https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Offline_Service_workers
/*self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(r => {
      console.log("[Service Worker] Fetching resource: " + e.request.url);
      return (
        r ||
        fetch(e.request).then(response => {
          return caches.open(CACHE_NAME).then(cache => {
            console.log(
              "[Service Worker] Caching new resource: " + e.request.url
            );
            cache.put(e.request, response.clone());
            return response;
          });
        })
      );
    })
  );
});*/
// https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Offline_Service_workers
self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(r => {
      //console.log("[Service Worker] Fetching resource: " + e.request.url);
      return (
        r ||
        fetch(e.request).then(async response => {
          if ("HEAD" !== e.request.method) {
            const cache = await caches.open(CACHE_NAME);
            console.log(
              "[Service Worker] Caching new resource: " + e.request.url
            );
            cache.put(e.request, response.clone());
          }
          return response;
        })
      );
    })
  );
});
