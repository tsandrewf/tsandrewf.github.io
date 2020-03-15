"use strict";

import { Setting } from "./setting.js";
import { openDb, windowOnloadKeyName, categoryHtmlKeyName } from "./db.js";
import { OutlayEntries } from "./outlayEntries.js";
import { OutlayCategory } from "./outlayCategory.js";
import { OutlaySummary } from "./outlaySummary.js";
import { OutlayEntryEdit } from "./outlayEntryEdit.js";
import { getQueryVar } from "./url.js";

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
    default:
      OutlayEntries.displayData();
      break;
  }
};

async function window_onload(funcName) {
  /* Only register a service worker if it's supported */
  // https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Offline_Service_workers
  if ("serviceWorker" in navigator) {
    const serviceWorker = "./service-worker.js";
    console.log('Registering of Setvice Worker "' + serviceWorker + '"');
    navigator.serviceWorker.register(serviceWorker);
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
