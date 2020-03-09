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
  // PNG
  "./icons/outlay256.png"
];

/*self.addEventListener("install", event => {
  console.log("👷", "install", event);
  self.skipWaiting();
});*/
self.addEventListener("install", function(event) {
  console.log("👷", "install", event);
  // задержим обработку события
  // если произойдёт ошибка, serviceWorker не установится
  event.waitUntil(
    // находим в глобальном хранилище Cache-объект с нашим именем
    // если такого не существует, то он будет создан
    caches.open(CACHE_NAME).then(function(cache) {
      // загружаем в наш cache необходимые файлы
      console.log("cache", cache);
      return cache.addAll(cacheUrls);
    })
  );
});

self.addEventListener("activate", event => {
  console.log("👷", "activate", event);
  return self.clients.claim();
});

/*self.addEventListener("fetch", function(event) {
  console.log("👷", "fetch", event.request.url);
  event.respondWith(fetch(event.request));
});*/
/*self.addEventListener("fetch", function(event) {
  console.log("👷", "fetch", event.request.url);
  event.respondWith(
    fetch(event.request)
      .then(function(response) {
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, response);
        });
      })
      .catch(function() {
        caches.match(event.request).then(function(responce) {
          return responce;
        });
      })
  );
});*/
self.addEventListener("fetch", function(event) {
  console.log("👷", "fetch", event.request.url);
  var response;
  event.respondWith(
    fetch(event.request)
      .then(function(r) {
        response = r;
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, response);
        });
        return response.clone();
      })
      .catch(function() {
        caches.match(event.request).then(function(response) {
          return response;
        });
      })
  );
});
