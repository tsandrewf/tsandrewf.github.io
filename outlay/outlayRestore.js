"use strict";

import { NavbarTop } from "./navbarTop.js";
import { NavbarBottom } from "./navbarBottom.js";
import { Setting } from "./setting.js";
import { Category } from "./category.js";
import { OutlayEntry } from "./outlayEntry.js";
import {
  db,
  settingObjectStoreName,
  outlayCategoryObjectStoreName,
  outlayObjectStoreName
} from "./db.js";
import { ObjectStore } from "./objectStore.js";

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
      titleHTML: "Восстановление",
      buttons: [
        /*{
          onclick: window.save,
          title: "Сохранить категорию",
          innerHTML: "&#10004;"
        }*/
      ]
    });

    NavbarBottom.show([
      { text: "Чеки", href: 'Javascript:displayData("OutlayEntries")' },
      { text: "Категории", href: 'Javascript:displayData("OutlayCategory")' },
      { text: "Итоги", href: 'Javascript:displayData("OutlaySummary")' }
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

      let spanFileSave;
      {
        spanFileSave = document.createElement("SPAN");
        divContent.appendChild(spanFileSave);
        const aRestore = document.createElement("SPAN");
        spanFileSave.appendChild(aRestore);
        aRestore.innerHTML = "Да";
        aRestore.classList.add("logButton");
        aRestore.onclick = function(e) {
          OutlayRestore.restore();
          e.preventDefault(); // предотвращает перемещение к "#"
        };
        spanFileSave.className = "logHidden";
      }

      const button = document.createElement("BUTTON");

      {
        divContent.appendChild(button);
        button.className = "logButton2";
        button.innerHTML = "Да";
        button.onclick = function(e) {
          OutlayRestore.restore();
          e.preventDefault(); // предотвращает перемещение к "#"
        };
        button.className = "logHidden";
      }

      inputFile.id = "inputFile";
      inputFile.type = "file";
      inputFile.style = "display:none";
      inputFile.onchange = function(e) {
        if (0 === this.files.length) {
          OutlayRestore.divLogClear();

          aFile.innerHTML = "Выберите файл архива";
          spanFilePrefix.style = "display:none";
          spanFileDescription.style = "display:none";
          //spanFileSave.className = "logHidden";
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
          //spanFileSave.className = "log";
          button.className = "logButton2";
        }
      };

      aFile.href = "#";
      aFile.innerHTML = "Выберите файл архива";
      aFile.onclick = function(e) {
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
      alert("Файл НЕ выбран");
      return;
    }
    if (1 > inputFile.files.length) {
      alert("Выбрано более одного файла (" + inputFile.files.length + ")");
      return;
    }

    const file = inputFile.files[0];
    if ("application/json" !== file.type) {
      alert("НЕдопустимый mime-тип (" + file.type + ") файла");
      return;
    }

    let reader = new FileReader();
    reader.onerror = function() {
      alert('Ошибка загрузки файла "' + file.name + '"' + reader.error);
    };

    reader.onload = async function() {
      let dbObect;
      try {
        dbObect = JSON.parse(reader.result);
      } catch (error) {
        alert("Ошибка структуры файла: " + error);
        return;
      }

      try {
        const transaction = db.transaction(
          [
            outlayCategoryObjectStoreName,
            outlayObjectStoreName,
            settingObjectStoreName
          ],
          "readwrite"
        );

        transaction.onabort = function() {
          console.log("onabort");
        };

        transaction.onerror = function(event) {
          console.log("Error: ", event);
          transaction.abort();
        };

        transaction.oncomplete = function() {
          const div = document.createElement("DIV");
          divLog.appendChild(div);
          div.innerText = "База данных восстановлена!";
        };

        OutlayRestore.divLogClear();
        {
          const div = document.createElement("DIV");
          divLog.appendChild(div);
          div.innerText = "Таблицы объектов:";
        }

        for (let [objectStoreName, objectStoreValue] of Object.entries(
          dbObect
        )) {
          const divObjectStore = document.createElement("DIV");
          divLog.appendChild(divObjectStore);
          divObjectStore.innerHTML = 'Таблица "' + objectStoreName + '"';
          const objectStore = new ObjectStore(objectStoreName);
          divObjectStore.innerHTML += "<BR>Очистка таблицы";
          await objectStore.clear(transaction);
          divObjectStore.innerHTML += " - выполнено!";

          divObjectStore.innerHTML += "<BR>Восстановление из архива: ";
          const spanPercent = document.createElement("SPAN");
          divObjectStore.appendChild(spanPercent);
          let recNum = 0;

          let recordRestore;
          switch (objectStoreName) {
            case "outlayCategory":
              recordRestore = async function(record, transaction) {
                await Category.set(record, transaction);
              };
              break;
            case "outlay":
              recordRestore = async function(record, transaction) {
                record.date = new Date(record.date);
                await OutlayEntry.set(record, transaction);
              };
              break;
            case "setting":
              recordRestore = async function(record, transaction) {
                await Setting.set(record.id, record.value, transaction);
              };
              break;
          }

          for (let record of objectStoreValue) {
            await recordRestore(record, transaction);
            spanPercent.innerText =
              ((++recNum / objectStoreValue.length) * 100).toFixed(0) +
              "% (" +
              recNum +
              " из " +
              objectStoreValue.length +
              ")";
          }
        }
      } catch (error) {
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
    div.innerText = "ОШИБКА: " + error.message;
    div.className = "logError";
  }
}
