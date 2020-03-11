const CACHE_NAME = "outlay_v_1";
const cacheUrls = [
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
  "./outlayBackup.js",
  "./outlayCategory.js",
  "./outlayCategoryEdit.js",
  "./outlayEntries.js",
  "./outlayEntry.js",
  "./outlayEntryEdit.js",
  "./outlaySummary.js",
  "./setting.js",
  "./standbyIndicator.js",
  "./url.js",
  // PNG
  "./icons/outlay256.png"
];

self.addEventListener("install", function(event) {
  console.log("Service Worker Install", event);
  //self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(cacheUrls);
    })
  );
});

self.addEventListener("activate", event => {
  console.log("Service Worker Activate", event);
  return self.clients.claim();
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
self.addEventListener("fetch", function(event) {
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
});
