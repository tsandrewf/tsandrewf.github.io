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

let divContent;
let divLog;

export class OutlayRestore {
  static displayData() {
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
      titleHTML: "Восстановление",
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

    document.title = "Архивирование и восстановление";

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
        spanFilePrefix.innerHTML = 'Восстановить базу данных из файла "';
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
        button.innerHTML = "Да";
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
          aFile.innerHTML = "Выберите файл архива";
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
      aFile.innerHTML = "Выберите файл архива";
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
    if (
      !window.confirm(
        "Вы действительно хотите восстановить базу данных из выбранного файла?"
      )
    )
      return;

    const inputFile = document.getElementById("inputFile");
    if (0 === inputFile.files.length) {
      OutlayRestore.divLogError(new Error("Файл НЕ выбран"));
      return;
    }
    if (1 > inputFile.files.length) {
      OutlayRestore.divLogError(
        new Error("Выбрано более одного файла (" + inputFile.files.length + ")")
      );
      return;
    }

    const file = inputFile.files[0];
    if ("application/json" !== file.type) {
      OutlayRestore.divLogError(
        new Error("НЕдопустимый mime-тип (" + file.type + ") файла")
      );
      return;
    }

    let reader = new FileReader();
    reader.onerror = function () {
      OutlayRestore.divLogError(new Error())(
        'Ошибка загрузки файла "' + file.name + '"' + reader.error
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
          new Error("Ошибка структуры файла: " + error)
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
          div.innerText = "База данных восстановлена!";
        };

        OutlayRestore.divLogClear();
        {
          const div = document.createElement("DIV");
          divLog.appendChild(div);
          div.innerText = "Восстановление таблиц объектов";
        }

        const ulObjectStoreList = document.createElement("UL");
        divLog.appendChild(ulObjectStoreList);

        for (let [objectStoreName, objectStoreValue] of Object.entries(
          dbObect
        )) {
          if (!db_objectStoreNames.includes(objectStoreName)) {
            throw new Error(
              'НЕдопустимое имя таблицы "' + objectStoreName + '"'
            );
          }

          const liObjectStore = document.createElement("LI");
          ulObjectStoreList.appendChild(liObjectStore);
          liObjectStore.innerHTML = 'Таблица "' + objectStoreName + '"';

          const ulObjectStore = document.createElement("UL");
          liObjectStore.appendChild(ulObjectStore);

          const objectStore = new ObjectStore(objectStoreName);

          {
            // Проверка таблицы из архива
            const liObjectStore = document.createElement("LI");
            ulObjectStore.appendChild(liObjectStore);
            liObjectStore.innerHTML = "Проверка архива: ";
            const spanPercent = document.createElement("SPAN");
            liObjectStore.appendChild(spanPercent);
            let recNum = 0;

            let keyArray;
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
            // Очистка таблицы
            const liObjectStore = document.createElement("LI");
            ulObjectStore.appendChild(liObjectStore);
            liObjectStore.innerHTML = "Очистка таблицы: ";
            await objectStore.clear(transaction);
            const spanPercent = document.createElement("SPAN");
            liObjectStore.appendChild(spanPercent);
            spanPercent.innerHTML = "100%";
          }

          {
            // Восстановление таблицы из архива
            const liObjectStore = document.createElement("LI");
            ulObjectStore.appendChild(liObjectStore);
            liObjectStore.innerHTML = "Восстановление из архива: ";
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
    div.innerText = "ОШИБКА: " + error.stack;
    div.className = "logError";
  }
}
