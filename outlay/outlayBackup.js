"use strict";

import { NavbarTop } from "./navbarTop.js";
import { NavbarBottom } from "./navbarBottom.js";

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
            href: 'Javascript:displayData("OutlayEntries")'
          },
          {
            innerHTML: "Категории расходов",
            href: 'Javascript:displayData("OutlayCategory")'
          },
          {
            innerHTML: "Итоги в разрезе категорий",
            href: 'Javascript:displayData("OutlaySummary")'
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
    if (window.caches) {
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
    }

    //<input type="file" id="input"></input>;
    const inputFile = document.createElement("INPUT");
    divContent.appendChild(inputFile);
    inputFile.type = "file";
  }
}
