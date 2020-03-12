"use strict";

import { NavbarTop } from "./navbarTop.js";
import { NavbarBottom } from "./navbarBottom.js";
import { Category } from "./category.js";
import { OutlayEntry } from "./outlayEntry.js";
import { outlayCategoryObjectStoreName, outlayObjectStoreName } from "./db.js";

let divContent;

function checkSupport(feature) {
  const div = document.createElement("DIV");
  divContent.appendChild(div);
  div.innerHTML =
    feature +
    " is " +
    (eval(feature)
      ? ""
      : ' <span style="font-weight:bold;color:red;">NOT</span>') +
    " OK!";
}

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
      titleHTML: "Категория затрат",
      buttons: [
        {
          onclick: window.save,
          title: "Сохранить категорию",
          innerHTML: "&#10004;"
        }
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

      const div = document.createElement("DIV");
      divContent.appendChild(div);
      div.innerHTML = "Архивирование и восстановление";
    }

    checkSupport("window.File");
    checkSupport("window.FileReader");
    checkSupport("window.FileList");
    checkSupport("window.Blob");
    checkSupport("window.requestFileSystem");
    checkSupport("window.webkitRequestFileSystem");
    checkSupport("window.FileSystem");
    checkSupport("window.caches");
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
    const inputFile = document.createElement("INPUT");
    divContent.appendChild(inputFile);
    inputFile.type = "file";

    const divOutput = document.createElement("DIV");
    divContent.appendChild(divOutput);
    const outputFile = document.createElement("INPUT");
    divOutput.appendChild(outputFile);
    outputFile.type = "button";
    outputFile.value = "Export";
    outputFile.onclick = OutlayBackup.export;
  }

  static async export() {
    try {
      const dateCurrent = new Date();
      const backupFileName =
        outlayCategoryObjectStoreName + "_" + dateCurrent._toCurrent();
      OutlayBackup.download(
        backupFileName,
        "const " +
          outlayCategoryObjectStoreName +
          "ObjectStoreBackup" +
          "=" +
          JSON.stringify(await Category.getAll()) +
          ";\n\r" +
          "const " +
          outlayObjectStoreName +
          "ObjectStoreBackup" +
          "=" +
          JSON.stringify(await OutlayEntry.getAll()) +
          ";"
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
}
