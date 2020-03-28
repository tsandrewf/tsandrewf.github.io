"use strict";

import { NavbarTop } from "./navbarTop.js";
import { NavbarBottom } from "./navbarBottom.js";

export class OutlayCategoryMove {
  static async displayData() {
    document.title = "Категории расходов";

    NavbarTop.show({
      menu: {
        buttonHTML: "&#9776;",
        content: [
          {
            innerHTML: "Переместить категорию",
            href: "#func=OutlayCategoryMove"
          },
          {
            innerHTML: "Чеки",
            href: "Javascript:OutlayEntries_displayData()"
          },
          {
            innerHTML: "Итоги в разрезе категорий",
            href: "Javascript:OutlaySummary_displayData()"
          },
          {
            innerHTML: "Утилиты",
            href: "#func=OutlayUtils"
          }
        ]
      },
      titleHTML: "Перемещение категории",
      buttons: [
        {
          onclick: OutlayCategoryMove.save,
          title: "Сохранить",
          innerHTML: "&#10004;"
        }
      ]
    });

    NavbarBottom.show([
      { text: "Чеки", href: "Javascript:OutlayEntries_displayData()" },
      { text: "Категории" },
      { text: "Итоги", href: "Javascript:OutlaySummary_displayData()" }
    ]);

    const divContent = document.getElementsByClassName("content")[0];
    {
      while (divContent.firstChild) {
        divContent.removeChild(divContent.firstChild);
      }
    }
  }

  static save() {
    console.log("Trying to save category move");
  }
}
