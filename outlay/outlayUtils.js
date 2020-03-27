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

  static export() {
    if (
      !window.confirm(
        "Вы действительно хотите архивировать базу данных расходов,"
      )
    )
      return;

    location.href = "#func=OutlayExport";
  }

  static restore() {
    window.history.pushState(null, "title");

    OutlayRestore.displayData();
  }
}
