"use strict";

import { NavbarTop } from "./navbarTop.js";
import { NavbarBottom } from "./navbarBottom.js";
import { Category } from "./category.js";
import { OutlayEntry } from "./outlayEntry.js";
import {
  db,
  settingObjectStoreName,
  outlayCategoryObjectStoreName,
  outlayObjectStoreName
} from "./db.js";

let divContent;

/*function checkSupport(feature) {
  const div = document.createElement("DIV");
  divContent.appendChild(div);
  div.innerHTML =
    feature +
    " is " +
    (eval(feature)
      ? ""
      : ' <span style="font-weight:bold;color:red;">NOT</span>') +
    " OK!";
}*/

export class OutlayBackup {
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

      /*const div = document.createElement("DIV");
      divContent.appendChild(div);
      div.innerHTML = "Архивирование и восстановление";*/
    }

    /*checkSupport("window.File");
    checkSupport("window.FileReader");
    checkSupport("window.FileList");
    checkSupport("window.Blob");
    checkSupport("window.requestFileSystem");
    checkSupport("window.webkitRequestFileSystem");
    checkSupport("window.FileSystem");
    checkSupport("window.caches");*/
    /*if (window.caches) {
      console.log("window.caches", window.caches);
      const cacheV1 = "v1";
      caches
        .has(cacheV1)
        .then(function(hasCache) {
          console.log('window.caches has cache "' + cacheV1 + '"', hasCache);
        })
        .catch(function() {
          console.log('window.caches has NO cache "' + cacheV1 + '"');
        });
    }*/

    //<input type="file" id="input"></input>;
    /*const inputFile = document.createElement("INPUT");
    divContent.appendChild(inputFile);
    inputFile.type = "file";

    const divOutput = document.createElement("DIV");
    divContent.appendChild(divOutput);
    const outputFile = document.createElement("INPUT");
    divOutput.appendChild(outputFile);
    outputFile.type = "button";
    outputFile.value = "Export";
    outputFile.onclick = OutlayBackup.export;*/

    const tbody = document.createElement("TBODY");
    {
      const table = document.createElement("TABLE");
      divContent.appendChild(table);
      table.className = "tableBase tableOutlayBackup";
      table.appendChild(tbody);
    }

    {
      let row = document.createElement("TR");
      tbody.appendChild(row);
      row.onclick = OutlayBackup.export;
      let td = document.createElement("TD");
      row.appendChild(td);
      td.innerHTML = "Архивирование базы данных";
    }

    {
      let row = document.createElement("TR");
      tbody.appendChild(row);
      //row.onclick = OutlayBackup.restore;
      let td = document.createElement("TD");
      row.appendChild(td);
      td.innerHTML = "Восстановление базы данных";

      const br = document.createElement("BR");
      td.appendChild(br);
      const inputFile = document.createElement("INPUT");
      td.appendChild(inputFile);
      inputFile.type = "file";
      inputFile.id = "inputFile";
      inputFile.onchange = OutlayBackup.restore;
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
      OutlayBackup.download(
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
        [outlayCategoryObjectStoreName, outlayObjectStoreName],
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
