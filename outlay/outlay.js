"use strict";

import { Setting } from "./setting.js";
import { openDb, windowOnloadKeyName, categoryHtmlKeyName } from "./db.js";
import { OutlayEntries } from "./outlayEntries.js";
import { OutlayCategory } from "./outlayCategory.js";
import { OutlayCategoryEdit } from "./outlayCategoryEdit.js";
import { OutlayCategoryMove } from "./outlayCategoryMove.js";
import { OutlaySummary } from "./outlaySummary.js";
import { OutlayEntryEdit } from "./outlayEntryEdit.js";
import { OutlayUtils } from "./outlayUtils.js";
import { OutlayExport } from "./outlayExport.js";
import { OutlayRestore } from "./outlayRestore.js";
import { OutlaySettings } from "./outlaySettings.js";
import { getQueryVar } from "./url.js";
import { Locale } from "./locale.js";
import { NavbarBottom } from "./navbarBottom.js";

function setOrientation() {
  alert("Orientation changed!");
  const navbarBottom = document.getElementsByClassName("navbar-bottom").item(0);
  const navbarLeft = document.getElementsByClassName("navbar-left").item(0);
  if (window.matchMedia("(orientation: portrait)").matches) {
    navbarBottom.style.display = "flex";
    navbarLeft.style.display = "none";
  } else {
    navbarBottom.style.display = "none";
    navbarLeft.style.display = "inline";
  }
}

//window.onorientationchange = setOrientation;

window.onload = openDb(window_onload);

window.OutlayEntries_displayData = OutlayEntries.displayData;
window.OutlayCategory_displayData = OutlayCategory.displayData;
window.OutlaySummary_displayData = OutlaySummary.displayData;

export const historyLengthInit = window.history.length;
export let historyLengthCurrent = historyLengthInit;
let historyLengthIncrease = false;
export function historyLengthIncreaseSet() {
  historyLengthIncrease = true;
}

window.displayData = async function (funcName) {
  const historyGo = historyLengthInit - historyLengthCurrent;
  if (historyGo) {
    await Setting.set(windowOnloadKeyName, funcName);
    history.go(historyGo);
  } else {
    switch (funcName) {
      case "OutlayCategory":
        OutlayCategory.displayData(getQueryVar("needCategorySave"));
        break;
      case "OutlaySummary":
        OutlaySummary.displayData();
        break;
      case "OutlaySettings":
        OutlaySettings.displayData();
        break;
      case "OutlayUtils":
        OutlayUtils.displayData();
        break;
      default:
        OutlayEntries.displayData();
        break;
    }
  }
  /*console.log(
    "action-bar height",
    document
      .getElementsByClassName("action-bar")
      .item(0)
      .getBoundingClientRect().height
  );
  console.log(
    "nav-bar height",
    document.getElementsByClassName("nav-bar").item(0).getBoundingClientRect()
      .height
  );
  console.log(
    "content height",
    document.getElementsByClassName("content").item(0).getBoundingClientRect()
      .height
  );*/
  //document.getElementsByClassName("content").item(0).style.height = "400px";
  /*document.getElementsByClassName("content").item(0).style.height =
    500 -
    document.getElementsByClassName("nav-bar").item(0).getBoundingClientRect()
      .height +
    "px";*/
  /*document.getElementsByClassName("content").item(0).style.height =
    "calc(100vh - 130px)";*/
  /*document.getElementsByClassName("content").item(0).style.height =
    "calc(100vh - " +
    (document
      .getElementsByClassName("action-bar")
      .item(0)
      .getBoundingClientRect().height +
      document.getElementsByClassName("nav-bar").item(0).getBoundingClientRect()
        .height) +
    "px)";
  console.log(
    "content height",
    document.getElementsByClassName("content").item(0).getBoundingClientRect()
      .height
  );*/
};

window.onpopstate = async function (event) {
  if (historyLengthIncrease) {
    historyLengthCurrent++;
    historyLengthIncrease = false;
  } else historyLengthCurrent--;

  let funcName = getQueryVar("func");
  if (!funcName) {
    funcName = await Setting.get(windowOnloadKeyName);
  } else {
    switch (funcName) {
      case null:
      case "OutlayEntries": // OutlayEntries
      case "OutlaySummary":
        await Setting.set(windowOnloadKeyName, funcName);
        break;
      case "OutlayCategory":
        if (getQueryVar("needCategorySave")) {
          OutlayCategory.displayData(getQueryVar("needCategorySave"));
          return;
        }
        //if (!getQueryVar("entryId")) {
        await Setting.set(windowOnloadKeyName, funcName);
        //}
        break;
      case "OutlayCategoryEdit":
        if (getQueryVar("id")) {
          OutlayCategoryEdit.displayData({ id: getQueryVar("id") });
          return;
        } else if (getQueryVar("parentId")) {
          OutlayCategoryEdit.displayData({ parentId: getQueryVar("parentId") });
          return;
        }
        break;
      case "OutlayRestore":
        OutlayRestore.displayData();
        return;
    }
  }

  switch (funcName) {
    case "OutlayEntries": // OutlayEntries
      OutlayEntries.displayData();
      break;
    case "OutlayCategory":
      OutlayCategory.displayData(getQueryVar("entryId"));
      break;
    case "OutlayCategoryMove":
      OutlayCategoryMove.displayData(getQueryVar("entryId"));
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
    case "OutlayExport":
      OutlayExport.displayData();
      break;
    case "OutlaySettings":
      OutlaySettings.displayData();
      break;
    default:
      OutlayEntries.displayData();
      break;
  }
};

async function window_onload() {
  NavbarBottom.show();

  await Locale.setUserLang();

  //NavbarBottom.show();

  /* Only register a service worker if it's supported */
  // https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Offline_Service_workers
  if ("serviceWorker" in navigator) {
    const serviceWorker = "./service-worker.js";
    console.log('Registering of Service Worker "' + serviceWorker + '"');
    //navigator.serviceWorker.register(serviceWorker);
    navigator.serviceWorker
      .register(serviceWorker)
      .then(navigator.serviceWorker.ready)
      .then(function () {
        console.log(
          "navigator.serviceWorker.controller",
          navigator.serviceWorker.controller
        );
        // ToDo!
        // Почему-то в EDGE при первом запуске после регистрации worker-а
        // navigator.serviceWorker.controller = null
        navigator.serviceWorker.controller.postMessage("outlay.html_onload");
        console.log('Sended message "outlay.html_onload"');
      });
  }

  const funcName = await Setting.get(windowOnloadKeyName);
  if (await Setting.get(categoryHtmlKeyName)) {
    // Если страница категорий сохранена, обнуляем эту страницу
    await Setting.set(categoryHtmlKeyName, null);
  }

  switch (funcName) {
    case "OutlayCategory":
      OutlayCategory.displayData(getQueryVar("needCategorySave"));
      break;
    case "OutlaySummary":
      OutlaySummary.displayData();
      break;
    case "OutlaySettings":
      OutlaySettings.displayData();
      break;
    case "OutlayUtils":
      OutlayUtils.displayData();
      break;
    default:
      OutlayEntries.displayData();
      break;
  }

  //setOrientation();
}
