"use strict";

import { NavbarTop } from "./navbarTop.js";
import { NavbarBottom } from "./navbarBottom.js";
import {
  db,
  settingObjectStoreName,
  outlayCategoryObjectStoreName,
  outlayObjectStoreName
} from "./db.js";

export class OutlayExport {
  static async displayData() {
    NavbarTop.show({
      menu: {
        buttonHTML: "&#9776;",
        content: [
          {
            innerHTML: "Чеки",
            href: "Javascript:OutlayEntries_displayData()"
          },
          {
            innerHTML: "Категории расходов",
            href: "Javascript:OutlayCategory_displayData()"
          },
          {
            innerHTML: "Итоги в разрезе категорий",
            href: "Javascript:OutlaySummary_displayData()"
          }
        ]
      },
      titleHTML: "Архивирование",
      buttons: [
        /*{
        onclick: window.save,
        title: "Сохранить категорию",
        innerHTML: "&#10004;"
      }*/
      ]
    });

    NavbarBottom.show([
      { text: "Чеки", href: "Javascript:OutlayEntries_displayData()" },
      { text: "Категории", href: "Javascript:OutlayCategory_displayData()" },
      { text: "Итоги", href: "Javascript:OutlaySummary_displayData()" }
    ]);

    document.title = "Архивирование и восстановление";

    const divContent = document.getElementsByClassName("content")[0];

    {
      while (divContent.firstChild) {
        divContent.removeChild(divContent.firstChild);
      }
    }

    if (window.history.state && window.history.state.content) {
      divContent.innerHTML = window.history.state.content;

      return;
    }

    const objectStoreNames = [
      settingObjectStoreName,
      outlayCategoryObjectStoreName,
      outlayObjectStoreName
    ];
    const transaction = db.transaction(objectStoreNames);
    let exportJSON = "";

    for (let objectStoreName of objectStoreNames) {
      const divObjectStore = document.createElement("DIV");
      divContent.appendChild(divObjectStore);
      divObjectStore.innerText = objectStoreName + " ";
      const spanPercent = document.createElement("SPAN");
      divObjectStore.appendChild(spanPercent);

      const recCount = await new Promise(function(resolve, reject) {
        let request = transaction.objectStore(objectStoreName).count();
        request.onsuccess = function() {
          resolve(request.result);
        };
        request.onerror = function() {
          reject(request.error);
        };
      });

      if (0 < recCount) {
        let recNum = 0;
        let objectStoreRecords = [];

        await new Promise(function(resolve, reject) {
          let request = transaction.objectStore(objectStoreName).openCursor();

          request.onsuccess = function(event) {
            const cursor = event.target.result;

            if (cursor) {
              objectStoreRecords.push(cursor.value);
              spanPercent.innerText =
                ((++recNum / recCount) * 100).toFixed(0) +
                "% (" +
                recNum +
                " из " +
                recCount +
                ")";
              cursor.continue();
            } else {
              resolve();
            }
          };

          request.onerror = function() {
            reject(request.error);
          };
        });

        if (exportJSON) exportJSON += ", ";
        exportJSON +=
          '"' +
          objectStoreName +
          '"' +
          " : " +
          JSON.stringify(objectStoreRecords);
      }
    }
    exportJSON = "{ " + exportJSON + " }";

    const backupFileName =
      outlayCategoryObjectStoreName + "_" + new Date()._toCurrent();

    if (window.navigator.msSaveBlob) {
      // Edge
      // https://stackoverflow.com/questions/44289189/javascript-file-download-edge-set-from-to-actual-site
      //window.navigator.msSaveOrOpenBlob(
      window.navigator.msSaveBlob(
        new Blob([exportJSON], { type: "application/json" }),
        backupFileName + ".json"
      );
    } else {
      OutlayExport.download(backupFileName, exportJSON);

      const div = document.createElement("DIV");
      divContent.appendChild(div);
      div.innerText = 'Создан файл "' + backupFileName + '.json"';
    }

    window.history.replaceState(
      {
        window_scrollY: window.scrollY,
        content: divContent.innerHTML
      },
      window.title
    );
  }

  static download(filename, text) {
    var element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:application/json;charset=utf-8," + encodeURIComponent(text)
    );
    element.setAttribute("download", filename);

    element.style.display = "none";
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }
}
