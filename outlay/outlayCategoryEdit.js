"use strict";

import { NavbarTop } from "./navbarTop.js";
import { NavbarBottom } from "./navbarBottom.js";
import { Category } from "./category.js";

let id;
let parentId;

export class OutlayCategoryEdit {
  static displayData(options) {
    try {
      id = options.id;
      parentId = options.parentId;

      let displayDataCategory = null;
      if (!options.id && !options.parentId) {
        throw new Error('НЕ задан ни один из параметров "id" и "parentId"');
      } else if (options.id && options.parentId) {
        throw new Error('ОДНОВРЕМЕННО заданы параметры "id" и "parentId"');
      } else if (options.id) {
        document.title = "Изменение категории расходов";
        window.OutlayCategorySave = OutlayCategoryEdit.saveEdit;
        displayDataCategory = OutlayCategoryEdit.displayDataCategoryEdit;
      } else if (options.parentId) {
        document.title = "Новая категория расходов";
        window.OutlayCategorySave = OutlayCategoryEdit.saveNew;
        displayDataCategory = OutlayCategoryEdit.displayDataCategoryNew;
      }

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
            onclick: window.OutlayCategorySave,
            title: "Сохранить категорию",
            innerHTML: "&#10004;"
          }
        ]
      });
      document.getElementsByClassName("navbar-top")[0].childNodes[1].innerHTML =
        document.title;

      NavbarBottom.show([
        { text: "Чеки", href: "Javascript:OutlayEntries_displayData()" },
        { text: "Категории", href: "Javascript:OutlayCategory_displayData()" },
        { text: "Итоги", href: "Javascript:OutlaySummary_displayData()" }
      ]);

      {
        const divContent = document.getElementsByClassName("content")[0];

        while (divContent.firstChild) {
          divContent.removeChild(divContent.firstChild);
        }

        const ul = document.createElement("UL");
        divContent.appendChild(ul);
        ul.style = "padding-left: 0;";
        ul.className = "upperCategory";
        const li = document.createElement("LI");
        li.id = "0";
        li.innerHTML = "&#9650; Корень";
        ul.appendChild(li);
      }

      displayDataCategory();
    } catch (error) {
      alert(error);
    }
  }

  static async categoryTree(category) {
    let upperCategoryArray = [];
    while (category) {
      upperCategoryArray.push(category);
      category = await Category.get(category.parentId);
    }

    let parentUl = document.getElementsByTagName("UL")[0];
    for (let category of upperCategoryArray.reverse()) {
      let ul = document.createElement("UL");
      parentUl.appendChild(ul);
      ul.className = "upperCategory";
      let li = document.createElement("LI");
      ul.appendChild(li);
      li.innerHTML = "&#9650; " + category.name;
      parentUl = ul;
    }

    let ul = document.createElement("UL");
    parentUl.appendChild(ul);
    ul.className = "upperCategory";
    let li = document.createElement("LI");
    ul.appendChild(li);
    li.innerHTML = "&#9650; ";
    let input = document.createElement("INPUT");
    input.id = "categoryName";
    li.appendChild(input);
    input.focus();
  }

  static async displayDataCategoryEdit() {
    window.OutlayCategorySave = OutlayCategoryEdit.saveEdit;

    id = Number(id);
    if (0 === id) {
      alert("НЕЛЬЗЯ изменять название корневой категории расходов");
      return;
    }

    const category = await Category.get(id);
    await OutlayCategoryEdit.categoryTree(
      await Category.get(category.parentId)
    );
    document.getElementById("categoryName").value = category.name;
  }

  static async displayDataCategoryNew() {
    parentId = Number(parentId);
    window.OutlayCategorySave = OutlayCategoryEdit.saveNew;
    OutlayCategoryEdit.categoryTree(await Category.get(parentId));
  }

  static async saveNew() {
    try {
      let categoryName = document.getElementById("categoryName").value.trim();
      if (!categoryName) {
        alert("НЕ задано название категории");
        return;
      }

      await Category.set({
        name: categoryName,
        parentId: parentId,
        expanded: false
      });

      if (0 !== parentId) {
        await Category.setExpanded(parentId, true);
      }

      window.history.back();
    } catch (error) {
      alert(error);
    }
  }

  static async saveEdit() {
    let categoryName = document.getElementById("categoryName").value.trim();
    if (!categoryName) {
      alert("НЕ задано название категории");
      return;
    }

    let category = await Category.get(id);
    if (categoryName === category.name) {
      alert("Название категории затрат НЕ изменено");
      return;
    }

    category.name = categoryName;
    await Category.set(category);

    window.history.back();
  }
}
