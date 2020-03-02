"use strict";

import { OutlayEntry } from "./outlayEntry.js";
import { Setting } from "./setting.js";
import {
  openDb,
  outlayDateSelectedKeyName,
  windowOnloadKeyName
} from "./db.js";
import { OutlayEntries } from "./outlayEntries.js";
import { OutlayCategory } from "./outlayCategory.js";
import { OutlaySummary } from "./outlaySummary.js";
import { OutlayEntryEdit } from "./outlayEntryEdit.js";

window.onload = openDb(window_onload);

window.displayData = window_onload;

async function window_onload(funcName) {
  if (window.history.state) {
    switch (window.history.state.url) {
      case "OutlayCategory":
        window.history.replaceState(null, window.title);
        OutlayCategory.displayData(true);
        break;
      case "OutlayEntryEdit":
        OutlayEntryEdit.displayData();
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
