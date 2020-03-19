"use strict";

const CACHE_NAME = "outlay_v_202003191754";

let cacheUrls = [
  // HTML
  /*"./outlay.html",
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
  "./icons/outlay256.png"*/
];

// https://stackoverflow.com/questions/5746598/is-it-possible-with-javascript-to-find-files-last-modified-time
var getMTime = function(url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open("HEAD", url, true); // use HEAD - we only need the headers
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4 && xhr.status === 200) {
      console.log("xhr", xhr);
      var mtime = new Date(xhr.getResponseHeader("Last-Modified"));
      const etag = xhr.getResponseHeader("etag");
      if (mtime.toString() === "Invalid Date") {
        callback(url); // dont want to return a bad date
      } else {
        callback(url, mtime, etag);
      }
    }
  };
  xhr.send();
};

self.addEventListener("message", async function(event) {
  if ("OutlayUpdateCheck" === event.data) {
    console.log('Received event "' + event.data + '"');
    const cache = await caches.open(CACHE_NAME);
    for (let request of await cache.keys()) {
      //console.log("request", request);
      let responseCached = await cache.match(request);
      //console.log("responseCached", responseCached);
      //console.log("responseCached etag", responseCached.headers.get("etag"));
      /*console.log(
        "responseCached last-modified",
        new Date(responseCached.headers.get("last-modified"))
      );*/
      request.headers.set("etag", responseCached.headers.get("etag"));
      request.headers.set(
        "last-modified",
        responseCached.headers.get("last-modified")
      );
      //console.log("request etag", request.headers.get("etag"));
      /*console.log(
        "request last-modified",
        new Date(request.headers.get("last-modified"))
      );*/
      try {
        const response = await fetch(request);
        //console.log("response", response);
        //console.log("response etag", response.headers.get("etag"));
        /*console.log(
        "response last-modified",
        new Date(response.headers.get("last-modified"))
      );*/
        if (
          response.headers.get("etag") !== request.headers.get("etag") ||
          response.headers.get("last-modified") !==
            request.headers.get("last-modified")
        ) {
          console.log("request", request);
          console.log('Different "etag" and/or "last-modified"');
          cache.put(request, response.clone());
          console.log(
            "-----------------------------------------------------------"
          );
        }
      } catch (error) {}
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
