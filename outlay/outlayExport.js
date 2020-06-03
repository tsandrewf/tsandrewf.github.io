"use strict";

import { NavbarTop } from "./navbarTop.js";
import { NavbarBottom } from "./navbarBottom.js";
import { db, db_objectStoreNames } from "./db.js";
import { ObjectStore } from "./objectStore.js";

export class OutlayExport {
  static async displayData() {
    NavbarTop.show({
      menu: {
        buttonHTML: "&#9776;",
        content: [
          {
            innerHTML: "Чеки",
            href: "Javascript:OutlayEntries_displayData()",
          },
          {
            innerHTML: "Категории расходов",
            href: "Javascript:OutlayCategory_displayData()",
          },
          {
            innerHTML: "Итоги в разрезе категорий",
            href: "Javascript:OutlaySummary_displayData()",
          },
        ],
      },
      titleHTML: "Архивирование",
      buttons: [
        /*{
        onclick: window.save,
        title: "Сохранить категорию",
        innerHTML: "&#10004;"
      }*/
      ],
    });

    NavbarBottom.show([
      { text: "Чеки", href: 'Javascript:displayData("OutlayEntries")' },
      { text: "Категории", href: 'Javascript:displayData("OutlayCategory")' },
      { text: "Итоги", href: 'Javascript:displayData("OutlaySummary")' },
    ]);

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

    const transaction = db.transaction(db_objectStoreNames);
    let exportJSON = "";

    const divLog = document.createElement("DIV");
    divContent.appendChild(divLog);
    divLog.className = "log";

    {
      const divLine = document.createElement("DIV");
      divLog.appendChild(divLine);
      divLine.innerText = "Таблицы объектов:";
    }

    for (let objectStoreName of db_objectStoreNames) {
      const divObjectStore = document.createElement("DIV");
      divLog.appendChild(divObjectStore);
      divObjectStore.innerText = '"' + objectStoreName + '": ';
      const spanPercent = document.createElement("SPAN");
      divObjectStore.appendChild(spanPercent);

      const recCount = await new ObjectStore(objectStoreName).getRecCount(
        transaction
      );

      if (0 < recCount) {
        let recNum = 0;
        let objectStoreRecords = [];

        await new Promise(function (resolve, reject) {
          let request = transaction.objectStore(objectStoreName).openCursor();

          request.onsuccess = function (event) {
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

          request.onerror = function () {
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

    const backupFileName = db.name + "_" + new Date()._toCurrent();

    if (window.navigator.msSaveBlob) {
      // Edge
      // https://stackoverflow.com/questions/44289189/javascript-file-download-edge-set-from-to-actual-site
      window.navigator.msSaveBlob(
        new Blob([exportJSON], { type: "application/json" }),
        backupFileName + ".json"
      );
    } else {
      OutlayExport.download(backupFileName, exportJSON);

      const div = document.createElement("DIV");
      divLog.appendChild(div);
      div.innerText = 'Создан файл "' + backupFileName + '.json"';
    }

    window.history.replaceState(
      {
        window_scrollY: window.scrollY,
        content: divContent.innerHTML,
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
