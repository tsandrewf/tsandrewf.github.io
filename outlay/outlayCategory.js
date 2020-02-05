"use strict";

import { Category } from "./category.js";
import { Setting } from "./setting.js";

import {
  db,
  openDb,
  outlayCategoryObjectStoreName,
  settingObjectStoreName,
  outlayObjectStoreName,
  outlayCategorySelectedKeyName
} from "./db.js";
import { getQueryVar } from "./url.js";
import { OutlayEntry } from "./outlayEntry.js";

let entryId;
let itemNum;

window.itemCategorySave = itemCategorySave;

async function itemCategorySave(categoryId) {
  let outlayEntry = await OutlayEntry.get(Number(entryId));
  outlayEntry.categories[itemNum - 1] = categoryId;
  await OutlayEntry.set(outlayEntry);

  history.go(-1);
}

window.onload = openDb(displayData);

let categorySelected;

const expanded = String.fromCharCode(9650);
const compressed = String.fromCharCode(9660);

window.outlayCategoryDel = outlayCategoryDel;

async function outlayCategoryDel() {
  try {
    if (!categorySelected) {
      throw Error("НЕ выбрана категория");
    }

    let categorySelectedId = Number(categorySelected.id);

    if (0 === categorySelectedId) {
      throw Error("НЕвозможно удалить корневую категорию");
    }

    if (
      !window.confirm("Вы действительно хотите удалить категорию расходов?")
    ) {
      return;
    }

    let transaction = db.transaction(
      [
        outlayCategoryObjectStoreName,
        settingObjectStoreName,
        outlayObjectStoreName
      ],
      "readwrite"
    );

    let categorySel = await Category.get(categorySelectedId, transaction);

    {
      let categorySelNewId;
      let categoryNextSibling = await Category.getNextSibling(
        categorySel,
        transaction
      );
      if (categoryNextSibling) {
        categorySelNewId = categoryNextSibling.id;
      } else {
        let categoryPreviousSibling = await Category.getPreviousSibling(
          categorySel,
          transaction
        );
        if (categoryPreviousSibling) {
          categorySelNewId = categoryPreviousSibling.id;
        } else {
          categorySelNewId = categorySel.parentId;
        }
      }

      Setting.set(outlayCategorySelectedKeyName, categorySelNewId, transaction);
    }

    let categoryDescendants = await Category.getDescendants(
      categorySel,
      transaction
    );

    {
      const categoryIsUsedReason = await Category.getIsUsedReason(
        categorySel.id,
        transaction
      );

      if (categoryIsUsedReason) {
        transaction.abort();

        throw new Error(
          "Категорию НЕЛЬЗЯ удалить, т.к. на нее " + categoryIsUsedReason
        );
      }

      transaction
        .objectStore(outlayCategoryObjectStoreName)
        .delete(categorySel.id);
    }

    {
      for (let categoryDescendant of categoryDescendants) {
        const categoryIsUsedReason = await Category.getIsUsedReason(
          categoryDescendant.id,
          transaction
        );

        if (categoryIsUsedReason) {
          transaction.abort();

          throw Error(
            'Категорию НЕЛЬЗЯ удалить, т.к. на ее подкатегорию "' +
              categoryDescendant.name +
              '" ' +
              categoryIsUsedReason
          );
        }

        transaction
          .objectStore(outlayCategoryObjectStoreName)
          .delete(categoryDescendant.id);
      }
    }

    transaction.onerror = function(event) {
      console.log("onerror");
    };

    transaction.onabort = function() {
      console.log("onabort");
    };

    transaction.oncomplete = function() {
      console.log("oncomplete");
    };
  } catch (error) {
    alert(error);
  } finally {
    document.location.reload(true);
  }
}

window.leafChange = leafChange;

function leafChange(elem) {
  let li = elem.parentElement;
  liOnClick(li);
  switch (elem.innerHTML) {
    case expanded:
      liCompress(li);
      break;
    case compressed:
      liExpand(li);
      break;
    default:
      console.log("I don't know: " + elem.innerText);
      break;
  }
}

async function liCompress(elem) {
  await Category.setExpanded(Number(elem.id), false);

  elem.getElementsByTagName("A")[0].innerHTML = compressed;
  for (let child of elem.children) {
    if ("UL" === child.tagName.toUpperCase()) child.style.display = "none";
  }
}

async function liExpand(elem) {
  await Category.setExpanded(Number(elem.id), true);

  elem.getElementsByTagName("A")[0].innerHTML = expanded;
  for (let child of elem.children) {
    if ("UL" === child.tagName.toUpperCase()) child.style.display = null;
  }
}

window.liOnClick = liOnClick;

function liOnClick(liCategory) {
  console.log(liCategory);
  if (liCategory === categorySelected) return;

  if (categorySelected)
    categorySelected
      .getElementsByTagName("SPAN")[0]
      .classList.remove("selectedCategory");

  categorySelected = liCategory;
  liCategory.getElementsByTagName("SPAN")[0].classList.add("selectedCategory");

  Setting.set(outlayCategorySelectedKeyName, Number(liCategory.id));
}

async function displayData() {
  alert("displayData()");
  try {
    entryId = getQueryVar("entryId");
    itemNum = getQueryVar("itemNum");

    let categorySelectedId = await Setting.get(outlayCategorySelectedKeyName);
    if (!categorySelectedId) categorySelectedId = 0;

    await displayTree(document.getElementById("0"), categorySelectedId);
  } catch (error) {
    alert(error);
  }
}

async function displayTree(node, categorySelectedId) {
  try {
    let nodeId = Number(node.id);

    let i = 0;
    let ul;
    let ulExpanded = true;

    for (let category of await Category.getChildren(nodeId)) {
      if (0 === i) {
        ul = document.createElement("UL");
        node.appendChild(ul);
        if (
          "false" === ul.parentElement.parentElement.getAttribute("expanded")
        ) {
          ul.style.display = "none";
        }
        ul.setAttribute("expanded", category.expanded);
      }
      let li = document.createElement("LI");
      ul.appendChild(li);
      li.id = category.id;
      let span = document.createElement("SPAN");
      if (categorySelectedId && li.id == categorySelectedId.toString()) {
        span.classList.add("selectedCategory");
        categorySelected = li;
      }
      let a = document.createElement("A");
      li.appendChild(a);
      li.appendChild(span);
      if ("false" == a.parentElement.parentElement.getAttribute("expanded"))
        a.innerHTML = compressed;
      else a.innerHTML = expanded;

      a.href = "#";
      a.onclick = function() {
        leafChange(this);
      };
      span.innerHTML = " " + category.name;
      if (entryId) {
        span.innerHTML += " ";
        let aItemCategorySave = document.createElement("A");
        li.appendChild(aItemCategorySave);
        aItemCategorySave.innerHTML = "&#10004;";
        aItemCategorySave.href =
          "JavaScript:itemCategorySave(" + category.id + ")";
      }
      span.onclick = function() {
        liOnClick(this.parentElement);
        return false;
      };

      await displayTree(li, categorySelectedId);
    }
  } catch (err) {
    console.log(err);
    alert("Ошибка: " + err);
  }
}

window.outlayCategoryEdit = outlayCategoryEdit;

function outlayCategoryEdit() {
  location.href = "outlayCategoryEdit.html?id=" + categorySelected.id;
}

window.outlayCategoryNew = outlayCategoryNew;

function outlayCategoryNew() {
  document.location.assign(
    "outlayCategoryEdit.html?parentId=" + categorySelected.id
  );
}
