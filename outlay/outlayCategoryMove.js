"use strict";

import { NavbarTop } from "./navbarTop.js";
import { NavbarBottom } from "./navbarBottom.js";
import { OutlayCategory } from "./outlayCategory.js";
import { OutlayEntry } from "./outlayEntry.js";
import {
  db,
  outlayObjectStoreName,
  outlayCategoryObjectStoreName,
  settingObjectStoreName,
  outlayCategorySelectedKeyName,
  outlayEntriesDateMinCalcKeyName,
} from "./db.js";
import { Setting } from "./setting.js";
import { Category } from "./category.js";

let categorySelectedId;
let categorySelected;
let categorySelectedParent;
let categorySelectedParentInit;

export class OutlayCategoryMove {
  static async displayData() {
    document.title = "Перемещение категории расходов";

    NavbarTop.show({
      menu: {
        buttonHTML: "&#9776;",
        content: [
          {
            innerHTML: "Переместить категорию",
            href: "#func=OutlayCategoryMove",
          },
          {
            innerHTML: "Чеки",
            href: "Javascript:OutlayEntries_displayData()",
          },
          {
            innerHTML: "Итоги в разрезе категорий",
            href: "Javascript:OutlaySummary_displayData()",
          },
          {
            innerHTML: "Утилиты",
            href: "#func=OutlayUtils",
          },
        ],
      },
      titleHTML: "Перемещение категории",
      buttons: [
        {
          onclick: OutlayCategoryMove.save,
          title: "Сохранить",
          innerHTML: "&#10004;",
          id: "buttonSave",
        },
      ],
    });

    NavbarBottom.show([
      { text: "Чеки", href: 'Javascript:displayData("OutlayEntries")' },
      { text: "Категории", href: 'Javascript:displayData("OutlayCategory")' },
      { text: "Итоги", href: 'Javascript:displayData("OutlaySummary")' },
    ]);

    const divContent = document.getElementsByClassName("content")[0];
    {
      while (divContent.firstChild) {
        divContent.removeChild(divContent.firstChild);
      }
    }

    divContent.appendChild(
      await OutlayCategory.displayTree(
        null,
        db.transaction(outlayCategoryObjectStoreName),
        true
      )
    );

    categorySelectedId = await Setting.get(outlayCategorySelectedKeyName);
    categorySelected = document.getElementById(categorySelectedId)
      .parentElement;
    categorySelected.className = "categoryToMove";
    categorySelectedParentInit = categorySelected.parentElement.parentElement;
    categorySelectedParent = categorySelectedParentInit;
    categorySelectedParent.className = "categoryToMoveParent";

    // https://vc.ru/dev/89555-javascript-massivy-peresechenie-raznost-i-obedinenie-v-es6
    for (let li of Array.prototype.slice
      .call(divContent.getElementsByTagName("LI"), 0)
      .filter(
        (x) =>
          !Array.prototype.slice
            .call(categorySelected.getElementsByTagName("LI"), 0)
            .includes(x)
      )) {
      li.querySelector("li > span:nth-child(2)").onclick =
        OutlayCategoryMove.categoryParentSelect;
    }

    OutlayCategoryMove.navbarTopRefresh();
  }

  static categoryParentSelect() {
    categorySelectedParent.className = null;

    categorySelectedParent = this.parentElement.parentElement;
    categorySelectedParent.className = "categoryToMoveParent";

    const categorySelectedText = categorySelected
      .querySelector(".categoryToMove > li > span:nth-child(2)")
      .innerHTML.trim();
    {
      let categoryMoved = false;
      for (let ul of categorySelectedParent.querySelectorAll(
        ".categoryToMoveParent > li > ul"
      )) {
        if (
          categorySelectedText <
          ul.querySelector("li > span:nth-child(2)").innerHTML.trim()
        ) {
          categorySelectedParent
            .querySelector(".categoryToMoveParent > li")
            .insertBefore(categorySelected, ul);
          categoryMoved = true;

          break;
        }
      }
      if (!categoryMoved) {
        categorySelectedParent
          .querySelector(".categoryToMoveParent > li")
          .appendChild(categorySelected);
      }
    }

    OutlayCategoryMove.navbarTopRefresh();
  }

  static navbarTopRefresh() {
    const navBarTopTitle = document
      .getElementsByClassName("navBarTopTitle")
      .item(0);

    navBarTopTitle.innerHTML =
      ' "' +
      categorySelected
        .querySelector(".categoryToMove > li > span:nth-child(2)")
        .innerHTML.trim() +
      '" из "' +
      categorySelectedParentInit
        .querySelector("li > span:nth-child(2)")
        .innerHTML.trim() +
      '"';

    if (categorySelectedParentInit === categorySelectedParent) {
      navBarTopTitle.innerHTML = "Перемещение " + navBarTopTitle.innerHTML;

      document.getElementById("buttonSave").className = "buttonDisabled";
    } else {
      navBarTopTitle.innerHTML =
        "Переместить " +
        navBarTopTitle.innerHTML +
        ' в "' +
        categorySelectedParent
          .querySelector("li > span:nth-child(2)")
          .innerHTML.trim() +
        '"';
    }
  }

  static async save() {
    if ("buttonDisabled" === document.getElementById("buttonSave").className) {
      return;
    }

    if (
      !window.confirm(
        'Вы действительно хотите переместить "' +
          categorySelected
            .querySelector(".categoryToMove > li > span:nth-child(2)")
            .innerHTML.trim() +
          '" из "' +
          categorySelectedParentInit
            .querySelector("li > span:nth-child(2)")
            .innerHTML.trim() +
          '" в "' +
          categorySelectedParent
            .querySelector("li > span:nth-child(2)")
            .innerHTML.trim() +
          '"?'
      )
    )
      return;

    try {
      const transaction = db.transaction(
        [
          outlayCategoryObjectStoreName,
          outlayObjectStoreName,
          settingObjectStoreName,
        ],
        "readwrite"
      );

      await Setting.set(
        outlayEntriesDateMinCalcKeyName,
        (await OutlayEntry.getEntryYoungest(transaction)).date,
        transaction
      );

      const category = await Category.get(categorySelectedId, transaction);
      category.parentId = Number(categorySelectedParent.firstChild.id);
      await Category.set(category, transaction);

      transaction.onerror = function (event) {
        alert("ОШИБКА: " + event.target.error);
      };

      transaction.oncomplete = function () {
        history.back();
      };
    } catch (error) {
      alert(error);
    }
  }
}
