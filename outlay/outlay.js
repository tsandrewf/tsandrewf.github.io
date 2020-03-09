"use strict";

import { Setting } from "./setting.js";
import { openDb, windowOnloadKeyName } from "./db.js";
import { OutlayEntries } from "./outlayEntries.js";
import { OutlayCategory } from "./outlayCategory.js";
import { OutlaySummary } from "./outlaySummary.js";
import { OutlayEntryEdit } from "./outlayEntryEdit.js";
import { OutlayBackup } from "./outlayBackup.js";

window.onload = openDb(window_onload);

window.displayData = window_onload;

async function window_onload(funcName) {
  /* Only register a service worker if it's supported */
  if ("serviceWorker" in navigator) {
    const serviceWorker = "./service-worker.js";
    console.log('Registering of Setvice Worker "' + serviceWorker + '"');
    navigator.serviceWorker.register(serviceWorker);
  }

  if (window.history.state) {
    switch (window.history.state.url) {
      case "OutlayCategory":
        window.history.replaceState(null, window.title);
        OutlayCategory.displayData(true);
        break;
      case "OutlayEntryEdit":
        OutlayEntryEdit.displayData();
        break;
      case "OutlayBackup":
        OutlayBackup.displayData();
        break;
    }

    return;
  }

  if (funcName) {
    await Setting.set(windowOnloadKeyName, funcName);
  } else {
    funcName = await Setting.get(windowOnloadKeyName);
  }

  switch (funcName) {
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
