"use strict";

import { NavbarTop } from "./navbarTop.js";
import { NavbarBottom } from "./navbarBottom.js";
import {
  db,
  settingObjectStoreName,
  outlayCategoryObjectStoreName,
  outlayObjectStoreName,
  db_objectStoreNames,
} from "./db.js";
import { ObjectStore } from "./objectStore.js";
import { OutlayEntry } from "./outlayEntry.js";
import { throwErrorIfNotNull } from "./base.js";
import { localeString } from "./locale.js";

let divContent;
let divLog;

export class OutlayRestore {
  static displayData() {
    NavbarTop.show({
      menu: {
        buttonHTML: "&#9776;",
        content: [
          {
            innerHTML: localeString.settings._capitalize(),
            href: "#func=OutlaySettings",
          },
          {
            innerHTML: localeString.utility._capitalize(),
            href: "#func=OutlayUtils",
          },
        ],
      },
      titleHTML: localeString.restore._capitalize(),
      buttons: [],
    });

    NavbarBottom.show([
      {
        text: localeString.checks._capitalize(),
        href: 'Javascript:displayData("OutlayEntries")',
      },
      {
        text: localeString.categories._capitalize(),
        href: 'Javascript:displayData("OutlayCategory")',
      },
      {
        text: localeString.results._capitalize(),
        href: 'Javascript:displayData("OutlaySummary")',
      },
    ]);

    document.title = localeString.restore._capitalize();

    {
      divContent = document.getElementsByClassName("content")[0];

      while (divContent.firstChild) {
        divContent.removeChild(divContent.firstChild);
      }
    }

    {
      let spanFilePrefix;
      {
        spanFilePrefix = document.createElement("SPAN");
        divContent.appendChild(spanFilePrefix);
        spanFilePrefix.innerHTML =
          localeString.restoreDatabaseFromFile._capitalize() + ' "';
        spanFilePrefix.className = "log";
        spanFilePrefix.style = "display:none";
      }

      const inputFile = document.createElement("INPUT");
      divContent.appendChild(inputFile);

      const aFile = document.createElement("A");
      divContent.appendChild(aFile);
      aFile.className = "log";

      const spanFileDescription = document.createElement("SPAN");
      divContent.appendChild(spanFileDescription);
      spanFileDescription.className = "log";

      const button = document.createElement("BUTTON");
      {
        divContent.appendChild(button);
        button.className = "logButton";
        button.style.width =
          (2 <= localeString.yes.length ? localeString.yes.length : 2) + "em";
        button.innerHTML = localeString.yes._capitalize();
        button.onclick = function (e) {
          OutlayRestore.restore();
          e.preventDefault(); // предотвращает перемещение к "#"
        };
        button.className = "logHidden";
      }

      inputFile.id = "inputFile";
      inputFile.type = "file";
      inputFile.style = "display:none";
      inputFile.onchange = function (e) {
        OutlayRestore.divLogClear();

        if (0 === this.files.length) {
          aFile.innerHTML = localeString.chooseFileToRestore._capitalize();
          spanFilePrefix.style = "display:none";
          spanFileDescription.style = "display:none";
          button.className = "logHidden";
        } else {
          const file = this.files[0];
          aFile.innerHTML = file.name;
          spanFileDescription.innerHTML =
            '" (' +
            (file.size ? (file.size / 1024).toFixed(2) : "") +
            "kB, " +
            (file.lastModifiedDate
              ? file.lastModifiedDate._toStringBriefWithTime()
              : "") +
            ")? ";
          spanFilePrefix.style = "display:inline";
          spanFileDescription.style = "display:inline";
          button.className = "logButton";
        }
      };

      aFile.href = "#";
      aFile.innerHTML = localeString.chooseFileToRestore._capitalize();
      aFile.onclick = function (e) {
        inputFile.click();
        e.preventDefault(); // предотвращает перемещение к "#"
      };

      spanFileDescription.style = "display:none";
    }

    divLog = document.createElement("DIV");
    divContent.appendChild(divLog);
    divLog.className = "log";
  }

  // https://ourcodeworld.com/articles/read/189/how-to-create-a-file-and-generate-a-download-with-javascript-in-the-browser-without-a-server
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

  static restore() {
    if (!window.confirm(localeString.confirmRestore._capitalize())) return;

    const inputFile = document.getElementById("inputFile");
    if (0 === inputFile.files.length) {
      OutlayRestore.divLogError(
        new Error(localeString.fileNotSelected._capitalize())
      );
      return;
    }
    if (1 > inputFile.files.length) {
      OutlayRestore.divLogError(
        new Error(
          localeString.moreThanOneFileSelected._capitalize() +
            " (" +
            inputFile.files.length +
            ")"
        )
      );
      return;
    }

    const file = inputFile.files[0];
    if ("application/json" !== file.type) {
      OutlayRestore.divLogError(
        new Error(
          localeString.invalidMimeType._capitalize() +
            " (" +
            file.type +
            ") " +
            localeString.ofFile
        )
      );
      return;
    }

    let reader = new FileReader();
    reader.onerror = function () {
      OutlayRestore.divLogError(new Error())(
        localeString.errorFileLoad._capitalize() +
          ' "' +
          file.name +
          '"' +
          reader.error
      );
    };

    reader.onload = async function () {
      let dbObect;
      try {
        dbObect = JSON.parse(reader.result, function (key, value) {
          return key.toLowerCase().includes("date") ? new Date(value) : value;
        });
      } catch (error) {
        OutlayRestore.divLogError(
          new Error(
            localeString.errorFileStructure._capitalize() + ": " + error
          )
        );
        return;
      }

      let transaction;
      try {
        transaction = db.transaction(db_objectStoreNames, "readwrite");

        transaction.onabort = function () {
          console.log("onabort");
        };

        transaction.onerror = function (event) {
          console.log("transaction.onerror", event);
          transaction._abortIfActive();
          OutlayRestore.divLogError(error);
        };

        transaction.oncomplete = function () {
          const div = document.createElement("DIV");
          divLog.appendChild(div);
          div.innerText = localeString.databaseRestored._capitalize();
        };

        OutlayRestore.divLogClear();
        {
          const div = document.createElement("DIV");
          divLog.appendChild(div);
          div.innerText = localeString.restorationOfTablesOfObjects._capitalize();
        }

        const ulObjectStoreList = document.createElement("UL");
        divLog.appendChild(ulObjectStoreList);

        for (let [objectStoreName, objectStoreValue] of Object.entries(
          dbObect
        )) {
          if (!db_objectStoreNames.includes(objectStoreName)) {
            throw new Error(
              localeString.invalidTableName._capitalize() +
                ' "' +
                objectStoreName +
                '"'
            );
          }

          const liObjectStore = document.createElement("LI");
          ulObjectStoreList.appendChild(liObjectStore);
          liObjectStore.innerHTML =
            localeString.table._capitalize() + ' "' + objectStoreName + '"';

          const ulObjectStore = document.createElement("UL");
          liObjectStore.appendChild(ulObjectStore);

          const objectStore = new ObjectStore(objectStoreName);

          {
            // Проверка таблицы из архива
            const liObjectStore = document.createElement("LI");
            ulObjectStore.appendChild(liObjectStore);
            liObjectStore.innerHTML =
              localeString.fileToRestoreCheck._capitalize() + ": ";
            const spanPercent = document.createElement("SPAN");
            liObjectStore.appendChild(spanPercent);
            let recNum = 0;

            let recordControl;
            switch (objectStoreName) {
              case settingObjectStoreName:
                recordControl = function (record) {
                  throwErrorIfNotNull(
                    record._diffStructure({
                      id: { type: "string", nullable: false },
                      value: { type: null, nullable: true },
                    })
                  );
                };
                break;
              case outlayObjectStoreName:
                recordControl = function (record) {
                  throwErrorIfNotNull(
                    record._diffStructure({
                      id: { type: "number", nullable: false },
                      date: { type: "date", nullable: false },
                      sumAll: { type: "number", nullable: false },
                      categories: {
                        type: "array",
                        nullable: false,
                        array: { type: "number", nullable: true },
                      },
                      categoryId: { type: "number", nullable: true },
                      sums: {
                        type: "array",
                        nullable: false,
                        array: { type: "number", nullable: true },
                      },
                    })
                  );

                  record.sumAll = OutlayEntry.getSumAll(record);
                };
                break;
              case outlayCategoryObjectStoreName:
                recordControl = function (record) {
                  throwErrorIfNotNull(
                    record._diffStructure({
                      id: { type: "number", nullable: false },
                      parentId: { type: "number", nullable: false },
                      name: { type: "string", nullable: false },
                      expanded: { type: "boolean", nullable: false },
                    })
                  );
                };
                break;
            }

            for (let record of objectStoreValue) {
              spanPercent.innerText =
                ((++recNum / objectStoreValue.length) * 100).toFixed(0) +
                "% (" +
                recNum +
                " из " +
                objectStoreValue.length +
                ")";
              recordControl(record);
            }
          }

          {
            // Table erase
            const liObjectStore = document.createElement("LI");
            ulObjectStore.appendChild(liObjectStore);
            liObjectStore.innerHTML =
              localeString.tableErase._capitalize() + ": ";
            await objectStore.clear(transaction);
            const spanPercent = document.createElement("SPAN");
            liObjectStore.appendChild(spanPercent);
            spanPercent.innerHTML = "100%";
          }

          {
            // Table restore from file
            const liObjectStore = document.createElement("LI");
            ulObjectStore.appendChild(liObjectStore);
            liObjectStore.innerHTML =
              localeString.tableRestoreFromFile._capitalize() + ": ";
            const spanPercent = document.createElement("SPAN");
            liObjectStore.appendChild(spanPercent);
            let recNum = 0;

            for (let record of objectStoreValue) {
              await objectStore.restoreRecord(record, transaction);
              // Следующий код только для отладки обработки ошибок при восстановлении
              /*if (outlayCategoryObjectStoreName === objectStoreName) {
              await Category.set(record, transaction);
            } else {
              await objectStore.restoreRecord(record, transaction);
            }*/
              spanPercent.innerText =
                ((++recNum / objectStoreValue.length) * 100).toFixed(0) +
                "% (" +
                recNum +
                " из " +
                objectStoreValue.length +
                ")";
            }
          }
        }
        //throw new Error("It''s OK!");
      } catch (error) {
        transaction._abortIfActive();
        OutlayRestore.divLogError(error);
      }
    };

    reader.readAsText(file);
  }

  static divLogClear() {
    while (divLog.firstChild) {
      divLog.removeChild(divLog.firstChild);
    }
  }

  static divLogError(error) {
    const div = document.createElement("DIV");
    divLog.appendChild(div);
    div.innerText = localeString.error._capitalize() + ": " + error.stack;
    div.className = "logError";
  }
}
