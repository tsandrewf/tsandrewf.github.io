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
import { OutlayRestore } from "./outlayRestore.js";

let divContent;

export class OutlayUtils {
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
      titleHTML: "Утилиты",
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

    const divUtils = document.createElement("DIV");
    divContent.appendChild(divUtils);
    divUtils.className = "utils";

    {
      // Архивирование
      const divBackup = document.createElement("DIV");
      divUtils.appendChild(divBackup);
      divBackup.onclick = OutlayUtils.export;
      divBackup.className = "utilItem";

      const divIcon = document.createElement("DIV");
      divBackup.appendChild(divIcon);
      // Спецсимволы
      // https://vsthemes.ru/posts/3239-simvoly-smajliki-emoji.html
      divIcon.innerHTML = "&#128190;";
      divIcon.className = "utilIcon";

      const divText = document.createElement("DIV");
      divBackup.appendChild(divText);
      divText.innerHTML = "Архивирование";
    }

    {
      // Восстановление
      const divBackup = document.createElement("DIV");
      divUtils.appendChild(divBackup);
      divBackup.onclick = OutlayUtils.restore;
      divBackup.className = "utilItem";

      const divIcon = document.createElement("DIV");
      divBackup.appendChild(divIcon);
      // Спецсимволы
      // https://vsthemes.ru/posts/3239-simvoly-smajliki-emoji.html
      divIcon.innerHTML = "&#128295;";
      divIcon.className = "utilIcon";

      const divText = document.createElement("DIV");
      divBackup.appendChild(divText);
      divText.innerHTML = "Восстановление";
    }
  }

  static async export() {
    if (
      !window.confirm(
        "Вы действительно хотите архивировать базу данных расходов,"
      )
    )
      return;

    try {
      const dateCurrent = new Date();
      const backupFileName =
        outlayCategoryObjectStoreName + "_" + dateCurrent._toCurrent();
      OutlayUtils.download(
        backupFileName,
        "{ " +
          '"' +
          settingObjectStoreName +
          '"' +
          " : " +
          JSON.stringify(await Setting.getAll()) +
          ", " +
          '"' +
          outlayCategoryObjectStoreName +
          '"' +
          " : " +
          JSON.stringify(await Category.getAll()) +
          ", " +
          '"' +
          outlayObjectStoreName +
          '"' +
          " : " +
          JSON.stringify(await OutlayEntry.getAll()) +
          "}"
      );
      alert('Создан файл "' + backupFileName + '"');
    } catch (error) {
      alert(error);
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
    window.history.pushState(null, "title");

    OutlayRestore.displayData();
    //alert('"Восстановление" в стадии реализации');
    return;

    console.log("restore");
    const inputFile = document.getElementById("inputFile");
    console.log("inputFile", inputFile.files);
    if (1 !== inputFile.files.length) {
      return;
    }
    const file = inputFile.files[0];
    console.log("file", file);
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
