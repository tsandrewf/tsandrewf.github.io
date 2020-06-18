"use strict";

import { NavbarTop } from "./navbarTop.js";
import { NavbarBottom } from "./navbarBottom.js";
import { Category } from "./category.js";
import { localeString } from "./locale.js";
import { setContentHeight } from "./pattern.js";
import { paramRefresh } from "./needRefresh.js";
import { compressed, expanded } from "./outlayCategory.js";
import { OutlayCategory } from "./outlayCategory.js";

let id;
let parentId;

const divOutlayCategoryEdit = document.getElementById("outlayCategoryEdit");

export class OutlayCategoryEdit {
  static displayData(options) {
    try {
      id = options.id;
      parentId = options.parentId;

      let document_title = null;
      let displayDataCategory = null;
      if (!options.id && !options.parentId) {
        throw new Error(
          localeString.noneOfTheParametersSpecified._capitalize() +
            '"id" ' +
            localeString.and +
            ' "parentId"'
        );
      } else if (options.id && options.parentId) {
        throw new Error(
          localeString.simultaneouslySetParameters._capitalize() +
            ' "id"' +
            localeString.and +
            '"parentId"'
        );
      } else if (options.id) {
        document_title = localeString.categoryEdit._capitalize();
        window.OutlayCategorySave = OutlayCategoryEdit.saveEdit;
        displayDataCategory = OutlayCategoryEdit.displayDataCategoryEdit;
      } else if (options.parentId) {
        document_title = localeString.newCategory._capitalize();
        window.OutlayCategorySave = OutlayCategoryEdit.saveNew;
        displayDataCategory = OutlayCategoryEdit.displayDataCategoryNew;
      }

      NavbarTop.show({
        back: localeString.categories._capitalize(),
        titleHTML: localeString.category._capitalize(),
        buttons: [
          {
            onclick: window.OutlayCategorySave,
            title: localeString.categorySave._capitalize(),
            innerHTML: "&#10004;",
          },
        ],
      });
      document.getElementsByClassName(
        "action-bar"
      )[0].childNodes[1].innerHTML = document_title;

      NavbarBottom.setActiveButton();

      setContentHeight();

      for (let div of document.querySelectorAll(".content > div")) {
        div.style.display = "none";
      }

      while (divOutlayCategoryEdit.firstChild) {
        divOutlayCategoryEdit.removeChild(divOutlayCategoryEdit.firstChild);
      }

      {
        const ul = document.createElement("UL");
        divOutlayCategoryEdit.appendChild(ul);
        ul.style = "padding-left: 0;";
        ul.className = "upperCategory";
        const li = document.createElement("LI");
        li.id = "0";
        li.innerHTML = "&#9650; " + localeString.root._capitalize();
        ul.appendChild(li);
      }

      displayDataCategory();
    } catch (error) {
      alert(error);
    }

    divOutlayCategoryEdit.style.display = "block";
  }

  static async categoryTree(category) {
    let upperCategoryArray = [];
    while (category) {
      upperCategoryArray.push(category);
      category = await Category.get(category.parentId);
    }

    let parentUl = divOutlayCategoryEdit.querySelector("UL");
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
      alert(localeString.rootCategoryCanNotBeChanged._capitalize());
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
    //try {
    let categoryName = document.getElementById("categoryName").value.trim();
    if (!categoryName) {
      alert(localeString.categoryNameNotSet._capitalize());
      return;
    }

    const categoryNewId = await Category.set({
      name: categoryName,
      parentId: parentId,
      expanded: false,
    });

    if (0 !== parentId) {
      await Category.setExpanded(parentId, true);
    }

    const selectedCategory = document.querySelector(
      "#outlayCategory .selectedCategory"
    );
    // :scope
    // https://stackoverflow.com/questions/3680876/using-queryselectorall-to-retrieve-direct-children
    {
      const ulNew = document.createElement("UL");
      ulNew.setAttribute("expanded", false);

      {
        let li = document.createElement("LI");
        ulNew.appendChild(li);
        li.id = categoryNewId;
        let spanName = document.createElement("SPAN");
        spanName.onclick = OutlayCategory.liNameOnClick;
        let spanExpand = document.createElement("SPAN");
        spanExpand.onclick = OutlayCategory.leafChange;
        li.appendChild(spanExpand);
        li.appendChild(spanName);
        spanExpand.innerHTML = compressed;

        spanName.innerHTML = " " + categoryName;
        spanName.innerHTML += " ";
        let aItemCategorySave = document.createElement("A");
        li.appendChild(aItemCategorySave);
        aItemCategorySave.innerHTML = "&#10004;";
        aItemCategorySave.href =
          "JavaScript:OutlayCategory_itemCategorySave(" + categoryNewId + ")";
      }

      let categoryInserted = false;
      for (let ul of selectedCategory.parentElement.querySelectorAll(
        ":scope > ul"
      )) {
        if (
          categoryName <
          ul.querySelector("li > span:nth-child(2)").innerHTML.trim()
        ) {
          selectedCategory.parentElement.insertBefore(ulNew, ul);
          categoryInserted = true;

          break;
        }
      }
      if (!categoryInserted) {
        selectedCategory.parentElement.appendChild(ulNew);
      }
    }

    window.history.back();
    //} catch (error) {
    //  alert(error);
    //}
  }

  static async saveEdit() {
    let categoryName = document.getElementById("categoryName").value.trim();
    if (!categoryName) {
      alert(localeString.categoryNameNotSet._capitalize());
      return;
    }

    let category = await Category.get(id);
    if (categoryName === category.name) {
      alert(localeString.categoryNameNotChanged._capitalize());
      return;
    }

    category.name = categoryName;
    await Category.set(category);

    document.querySelector("#outlayCategory .selectedCategory").innerText =
      " " + category.name + " ";

    if (!paramRefresh.outlaySummary.needRefresh) {
      for (let td of document.querySelectorAll(
        '#outlaySummary > table > tbody > tr[categoryid="' +
          id +
          '"] > #tdCategoryName'
      )) {
        td.innerText = category.name;
      }
    }

    window.history.back();
  }
}
