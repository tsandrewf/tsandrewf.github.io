"use strict";

import { Setting } from "./setting.js";
import { openDb, windowOnloadKeyName } from "./db.js";
import { OutlayEntries } from "./outlayEntries.js";
import { OutlayCategory } from "./outlayCategory.js";
import { OutlaySummary } from "./outlaySummary.js";
import { OutlayEntryEdit } from "./outlayEntryEdit.js";
import { OutlayBackup } from "./outlayBackup.js";
import { getQueryVar } from "./url.js";

window.onload = openDb(window_onload);

window.OutlayEntries_displayData = OutlayEntries.displayData;
window.OutlayCategory_displayData = OutlayCategory.displayData;
window.OutlaySummary_displayData = OutlaySummary.displayData;

window.onpopstate = async function(event) {
  const url = new URL(location.href);

  let funcName = getQueryVar("func");
  console.log("funcName", funcName);
  if (!funcName) {
    funcName = await Setting.get(windowOnloadKeyName);
  } else {
    switch (funcName) {
      case null:
      case "Outlay": // OutlayEntries
      case "OutlayCategory":
      case "OutlaySummary":
        await Setting.set(windowOnloadKeyName, funcName);
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
      let entryId = Number(getQueryVar("entryId"));
      console.log("entryId", entryId);
      OutlayEntryEdit.displayData(entryId);
      break;
    default:
      OutlayEntries.displayData();
      break;
  }
};

async function window_onload(funcName) {
  /* Only register a service worker if it's supported */
  /*if ("serviceWorker" in navigator) {
    const serviceWorker = "./service-worker.js";
    console.log('Registering of Setvice Worker "' + serviceWorker + '"');
    navigator.serviceWorker.register(serviceWorker);
  }
  console.log("caches", caches.keys);*/

  // https://shterkel.com/pwa.html
  if (navigator.serviceWorker.controller) {
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
  }

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
