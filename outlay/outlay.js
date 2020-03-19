"use strict";

import { Setting } from "./setting.js";
import { openDb, windowOnloadKeyName, categoryHtmlKeyName } from "./db.js";
import { OutlayEntries } from "./outlayEntries.js";
import { OutlayCategory } from "./outlayCategory.js";
import { OutlaySummary } from "./outlaySummary.js";
import { OutlayEntryEdit } from "./outlayEntryEdit.js";
import { OutlayUtils } from "./outlayUtils.js";
import { getQueryVar } from "./url.js";
//import { CACHE_NAME } from "./service-worker.js";

window.onload = openDb(window_onload);

window.OutlayEntries_displayData = OutlayEntries.displayData;
window.OutlayCategory_displayData = OutlayCategory.displayData;
window.OutlaySummary_displayData = OutlaySummary.displayData;

window.onpopstate = async function(event) {
  const url = new URL(location.href);

  let funcName = getQueryVar("func");
  if (!funcName) {
    funcName = await Setting.get(windowOnloadKeyName);
  } else {
    switch (funcName) {
      case null:
      case "Outlay": // OutlayEntries
      case "OutlaySummary":
        await Setting.set(windowOnloadKeyName, funcName);
        break;
      case "OutlayCategory":
        if (!getQueryVar("entryId")) {
          await Setting.set(windowOnloadKeyName, funcName);
        }
        break;
    }
  }

  switch (funcName) {
    case "Outlay": // OutlayEntries
      OutlayEntries.displayData();
      break;
    case "OutlayCategory":
      OutlayCategory.displayData(getQueryVar("entryId"));
      break;
    case "OutlaySummary":
      OutlaySummary.displayData();
      break;
    case "OutlayEntryEdit":
      OutlayEntryEdit.displayData(Number(getQueryVar("entryId")));
      break;
    case "OutlayUtils":
      OutlayUtils.displayData();
      break;
    default:
      OutlayEntries.displayData();
      break;
  }
};

// https://stackoverflow.com/questions/5746598/is-it-possible-with-javascript-to-find-files-last-modified-time
/*var getMTime = function(url, callback) {
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
};*/

async function window_onload(funcName) {
  /* Only register a service worker if it's supported */
  // https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Offline_Service_workers
  if ("serviceWorker" in navigator) {
    const serviceWorker = "./service-worker.js";
    console.log('Registering of Service Worker "' + serviceWorker + '"');
    //navigator.serviceWorker.register(serviceWorker);
    navigator.serviceWorker
      .register(serviceWorker)
      .then(navigator.serviceWorker.ready)
      .then(function() {
        navigator.serviceWorker.controller.postMessage("OutlayUpdateCheck");
      });

    /*getMTime("./base.css", async function(url, mtime, responseEtag) {
      if (mtime) {
        console.log('the mtime of "' + url + '" is: ' + mtime);
        const cache = await caches.open("outlay_v_202003191127");
        cache.match(new Request(url)).then(function(response) {
          console.log("response", response);
          console.log("responseEtag", responseEtag);
          console.log("etag", response.headers.get("etag"));
          const lastModified = new Date(response.headers.get("last-modified"));
          console.log("last-modified", lastModified);
          if (mtime.getTime() === lastModified.getTime()) {
            console.log('last-modified: File "' + url + '" is fresh');
          } else {
            console.log('last-modified: File "' + url + '" need to be updated');
          }
        });
      }
    });*/
  }

  if (await Setting.get(categoryHtmlKeyName)) {
    // Если страница категорий сохранена, обнуляем эту страницу
    await Setting.set(categoryHtmlKeyName, null);
  }

  // https://shterkel.com/pwa.html
  /*if (navigator.serviceWorker.controller) {
    console.log(
      "[PWA Builder] active service worker found, no need to register"
    );
  } else {
    navigator.serviceWorker
      .register("./service-worker.js", {
        scope: "./"
      })
      .then(function(reg) {
        console.log(
          "Service worker has been registered for scope:" + reg.scope
        );
      });
  }*/

  switch (await Setting.get(windowOnloadKeyName)) {
    case "OutlayCategory":
      OutlayCategory.displayData();
      break;
    case "OutlaySummary":
      OutlaySummary.displayData();
      break;
    default:
      OutlayEntries.displayData();
      break;
  }
}
