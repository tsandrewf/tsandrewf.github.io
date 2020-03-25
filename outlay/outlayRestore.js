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

let divContent;

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
      { text: "Чеки", href: "Javascript:OutlayEntries_displayData()" },
      { text: "Категории", href: "Javascript:OutlayCategory_displayData()" },
      { text: "Итоги", href: "Javascript:OutlaySummary_displayData()" }
    ]);

    document.title = "Архивирование и восстановление";

    {
      divContent = document.getElementsByClassName("content")[0];

      while (divContent.firstChild) {
        divContent.removeChild(divContent.firstChild);
      }
    }

    {
      const spanFilePrefix = document.createElement("SPAN");
      divContent.appendChild(spanFilePrefix);
      const aRestore = document.createElement("A");
      spanFilePrefix.appendChild(aRestore);
      aRestore.innerHTML = "Восстановить";
      aRestore.href = "#";
      aRestore.onclick = function(e) {
        OutlayRestore.restore();
        e.preventDefault(); // предотвращает перемещение к "#"
      };
      const spanFilePrefixText = document.createElement("SPAN");
      spanFilePrefix.appendChild(spanFilePrefixText);
      spanFilePrefixText.innerHTML = " базу данных из файла: ";
      spanFilePrefix.style = "display:none";

      const inputFile = document.createElement("INPUT");
      divContent.appendChild(inputFile);

      const aFile = document.createElement("A");
      divContent.appendChild(aFile);

      const spanFileDescription = document.createElement("SPAN");
      divContent.appendChild(spanFileDescription);

      inputFile.id = "inputFile";
      inputFile.type = "file";
      inputFile.style = "display:none";
      inputFile.onchange = function(e) {
        console.log("inputFile.onchange", e.target.value);
        console.log("this.files", this.files);
        if (0 === this.files.length) {
          aFile.innerHTML = "Выберите файл архива";
          spanFilePrefix.style = "display:none";
          spanFileDescription.style = "display:none";
        } else {
          const file = this.files[0];
          aFile.innerHTML = file.name;
          spanFileDescription.innerHTML =
            " (" +
            (file.size ? (file.size / 1024).toFixed(2) : "") +
            "kB, " +
            (file.lastModifiedDate
              ? file.lastModifiedDate._toStringBriefWithTime()
              : "") +
            ")";
          spanFilePrefix.style = "display:inline";
          spanFileDescription.style = "display:inline";
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
    if (1 !== inputFile.files.length) {
      return;
    }
    const file = inputFile.files[0];
    if ("application/json" !== file.type) {
      console.log("file.type", file.type);
      return;
    }

    let reader = new FileReader();
    reader.onerror = function() {
      alert('Ошибка загрузки файла "' + file.name + '"' + reader.error);
    };

    reader.onload = async function() {
      const dbObect = JSON.parse(reader.result);

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
      };
      transaction.oncomplete = function() {
        console.log("Database restored!");
      };

      await Setting.clear(transaction);
      for (let setting of dbObect.setting) {
        await Setting.set(setting.id, setting.value, transaction);
      }

      await Category.clear(transaction);
      for (let category of dbObect.outlayCategory) {
        await Category.set(category, transaction);
      }

      await OutlayEntry.clear(transaction);
      for (let entry of dbObect.outlay) {
        entry.date = new Date(entry.date);
        await OutlayEntry.set(entry, transaction);
      }
    };

    reader.readAsText(file);
  }
}
