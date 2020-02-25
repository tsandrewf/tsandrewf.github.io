"use strict";

import { Category } from "./category.js";
import { Setting } from "./setting.js";
import { StandbyIndicator } from "./standbyIndicator.js";
import { OutlayCategoryEdit } from "./outlayCategoryEdit.js";

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
  if (StandbyIndicator.isShowing()) return;

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
  if (StandbyIndicator.isShowing()) return;

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

  //elem.getElementsByTagName("A")[0].innerHTML = compressed;
  elem.getElementsByTagName("SPAN")[0].innerHTML = compressed;
  for (let child of elem.children) {
    if ("UL" === child.tagName.toUpperCase()) child.style.display = "none";
  }
}

async function liExpand(elem) {
  await Category.setExpanded(Number(elem.id), true);

  //elem.getElementsByTagName("A")[0].innerHTML = expanded;
  elem.getElementsByTagName("SPAN")[0].innerHTML = expanded;
  for (let child of elem.children) {
    if ("UL" === child.tagName.toUpperCase()) child.style.display = null;
  }
}

window.liOnClick = liOnClick;

async function liOnClick(liCategory) {
  if (StandbyIndicator.isShowing()) return;

  if (liCategory === categorySelected) return;

  if (categorySelected)
    categorySelected
      .getElementsByTagName("SPAN")[1]
      .classList.remove("selectedCategory");

  categorySelected = liCategory;
  liCategory.getElementsByTagName("SPAN")[1].classList.add("selectedCategory");

  await Setting.set(outlayCategorySelectedKeyName, Number(liCategory.id));
}

async function displayData() {
  window.history.pushState({ data: "data" }, "title");
  try {
    StandbyIndicator.show();

    document.title = "Категории расходов";

    NavbarTop.show({
      menu: {
        buttonHTML: "&#9776;",
        content: [
          { innerHTML: "Чеки", href: "outlay.html" },
          { innerHTML: "Итоги в разрезе категорий", href: "outlaySummary.html" }
        ]
      },
      titleHTML: "Категории расходов",
      buttons: [
        {
          onclick: outlayCategoryNew,
          title: "Добавить категорию",
          innerHTML: "&#10010;"
        },
        {
          onclick: outlayCategoryEdit,
          title: "Изменить название категории",
          innerHTML: "&#9999;"
        },
        {
          onclick: outlayCategoryDel,
          title: "Удалить категорию",
          innerHTML: "&#10006;"
        }
      ]
    });

    NavbarBottom.show([
      { text: "Чеки", href: "outlay.html" },
      { text: "Категории" },
      { text: "Итоги", href: "outlaySummary.html" }
    ]);

    entryId = getQueryVar("entryId");
    itemNum = getQueryVar("itemNum");

    let categorySelectedId = await Setting.get(outlayCategorySelectedKeyName);
    if (!categorySelectedId) categorySelectedId = 0;

    let ulRoot = document.createElement("UL");
    ulRoot.setAttribute("expanded", "true");
    ulRoot.style.paddingLeft = "0";
    let liRoot = document.createElement("LI");
    liRoot.id = "0";
    ulRoot.appendChild(liRoot);
    let spanExpanded = document.createElement("SPAN");
    spanExpanded.innerHTML = expanded;
    liRoot.appendChild(spanExpanded);
    let spanCategoryName = document.createElement("SPAN");
    spanCategoryName.innerHTML = "Корень";
    spanCategoryName.onclick = leaf_name_onclick;
    liRoot.appendChild(spanCategoryName);
    await displayTree(
      liRoot,
      categorySelectedId,
      db.transaction(outlayCategoryObjectStoreName)
    );
    document
      .getElementsByClassName("content")
      .item(0)
      .appendChild(ulRoot);

    categorySelected = document.getElementById(categorySelectedId);
    if (!categorySelectedId) {
      categorySelected
        .getElementsByTagName("SPAN")[1]
        .classList.add("selectedCategory");
    }
  } catch (error) {
    alert(error);
  } finally {
    StandbyIndicator.hide();
  }
}

const leaf_name_onclick = function() {
  liOnClick(this.parentElement);
  return false;
};

const leaf_expand_onclick = function() {
  leafChange(this);
};

async function displayTree(node, categorySelectedId, transaction) {
  try {
    let nodeId = Number(node.id);

    let i = 0;
    let ul;

    for (let category of await Category.getChildren(nodeId, transaction)) {
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
      //let a = document.createElement("A");
      let a = document.createElement("SPAN");
      li.appendChild(a);
      li.appendChild(span);
      if ("false" == a.parentElement.parentElement.getAttribute("expanded"))
        a.innerHTML = compressed;
      else a.innerHTML = expanded;

      //a.href = "#";
      a.onclick = leaf_expand_onclick;
      span.innerHTML = " " + category.name;
      if (entryId) {
        span.innerHTML += " ";
        let aItemCategorySave = document.createElement("A");
        li.appendChild(aItemCategorySave);
        aItemCategorySave.innerHTML = "&#10004;";
        aItemCategorySave.href =
          "JavaScript:itemCategorySave(" + category.id + ")";
      }
      span.onclick = leaf_name_onclick;

      await displayTree(li, categorySelectedId);
    }
  } catch (err) {
    console.log(err);
    alert("Ошибка: " + err);
  }
}

window.outlayCategoryEdit = outlayCategoryEdit;

function outlayCategoryEdit() {
  if (StandbyIndicator.isShowing()) return;

  //location.href = "outlayCategoryEdit.html?id=" + categorySelected.id;
  OutlayCategoryEdit.displayData({ id: categorySelected.id });
}

window.outlayCategoryNew = outlayCategoryNew;

function outlayCategoryNew() {
  if (StandbyIndicator.isShowing()) return;

  /*document.location.assign(
    "outlayCategoryEdit.html?parentId=" + categorySelected.id
  );*/
  OutlayCategoryEdit.displayData({ parentId: categorySelected.id });
}
