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

function getNodeCategoryNew(category) {
  let ul = document.createElement("UL");
  if ("false" === category.expanded) {
    ul.style.display = "none";
  }
  ul.setAttribute("expanded", category.expanded);

  let li = document.createElement("LI");
  ul.appendChild(li);
  li.id = category.id;
  let spanName = document.createElement("SPAN");
  let spanExpand = document.createElement("SPAN");
  li.appendChild(spanExpand);
  li.appendChild(spanName);
  spanExpand.innerHTML = "false" == category.expanded ? expanded : compressed;

  spanName.innerHTML = " " + category.name;
  if (entryId) {
    spanName.innerHTML += " ";
    let aItemCategorySave = document.createElement("A");
    li.appendChild(aItemCategorySave);
    aItemCategorySave.innerHTML = "&#10004;";
    aItemCategorySave.href = "JavaScript:itemCategorySave(" + category.id + ")";
  }

  return ul;
}

function categorySelectedMark(categorySel) {
  if (categorySelected) {
    categorySelected
      .getElementsByTagName("SPAN")[1]
      .classList.remove("selectedCategory");
  }

  if ("number" == typeof categorySel) {
    categorySelected = document.getElementById(categorySel);
  } else if ("object" == typeof categorySel) {
    if ("LI" === categorySel.tagName.toUpperCase()) {
      categorySelected = categorySel;
    }
  }

  categorySelected
    .getElementsByTagName("SPAN")[1]
    .classList.add("selectedCategory");
}

window.itemCategorySave = itemCategorySave;

async function itemCategorySave(categoryId) {
  let outlayEntry = await OutlayEntry.get(Number(entryId));
  outlayEntry.categories[itemNum - 1] = categoryId;
  await OutlayEntry.set(outlayEntry);

  history.back();
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

    let categorySelNewId;
    {
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
    {
      document
        .getElementById(categorySel.parentId)
        .removeChild(document.getElementById(categorySel.id).parentElement);

      categorySelectedMark(categorySelNewId);
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
    //document.location.reload(true);
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

  categorySelectedMark(liCategory);

  await Setting.set(outlayCategorySelectedKeyName, Number(liCategory.id));
}

async function displayData() {
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

    if (window.history.state && window.history.state.content) {
      document.getElementsByClassName("content")[0].innerHTML =
        window.history.state && window.history.state.content;

      const categorySel = await Category.get(categorySelectedId);
      const liCategory = document.getElementById(categorySelectedId);
      const categoryName = liCategory.childNodes[1].innerHTML.trim();
      if (categorySel.name !== categoryName) {
        liCategory.childNodes[1].innerHTML = " " + categorySel.name;
        const ulCategory = liCategory.parentElement;
        const parentNode = ulCategory.parentElement;
        parentNode.removeChild(ulCategory);
        let ulCategoryChilds = Array.from(parentNode.childNodes).filter(
          node => "UL" === node.tagName
        );
        {
          let categoryRestored = false;
          for (let node of ulCategoryChilds) {
            if (
              " " + categorySel.name <
              node.firstChild.childNodes[1].innerHTML
            ) {
              parentNode.insertBefore(ulCategory, node);
              categoryRestored = true;
              break;
            }
          }
          if (!categoryRestored) {
            parentNode.appendChild(ulCategory);
          }
        }
      } else {
        const categoryChildren = await Category.getChildren(categorySelectedId);
        let ulCategoryChilds = Array.from(liCategory.childNodes).filter(
          node => "UL" === node.tagName
        );
        if (categoryChildren.length !== ulCategoryChilds.length) {
          for (let i = 0; i < categoryChildren.length; i++) {
            const category = categoryChildren[i];
            if (!ulCategoryChilds[i]) {
              liCategory.appendChild(getNodeCategoryNew(category));
              liExpand(liCategory);
            } else if (ulCategoryChilds[i].firstChild.id != category.id) {
              liCategory.insertBefore(
                getNodeCategoryNew(category),
                ulCategoryChilds[i]
              );
              liExpand(liCategory);
              break;
            }
          }
        }
      }
    } else {
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
      await displayTree(liRoot, db.transaction(outlayCategoryObjectStoreName));
      document
        .getElementsByClassName("content")
        .item(0)
        .appendChild(ulRoot);

      /*let categorySelectedId = await Setting.get(outlayCategorySelectedKeyName);
    if (!categorySelectedId) categorySelectedId = 0;
    categorySelectedMark(categorySelectedId);*/
    }

    categorySelectedMark(categorySelectedId);

    if (window.history.state) {
      window.scrollTo(0, window.history.state.window_scrollY);
      window.history.replaceState(null, window.title);
    }

    for (let li of document.body
      .getElementsByClassName("content")[0]
      .getElementsByTagName("LI")) {
      li.childNodes[0].onclick = leaf_expand_onclick;
      li.childNodes[1].onclick = leaf_name_onclick;
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

async function displayTree(node, transaction) {
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
      let spanName = document.createElement("SPAN");
      let spanExpand = document.createElement("SPAN");
      li.appendChild(spanExpand);
      li.appendChild(spanName);
      spanExpand.innerHTML =
        "false" ==
        spanExpand.parentElement.parentElement.getAttribute("expanded")
          ? compressed
          : expanded;

      spanName.innerHTML = " " + category.name;
      if (entryId) {
        spanName.innerHTML += " ";
        let aItemCategorySave = document.createElement("A");
        li.appendChild(aItemCategorySave);
        aItemCategorySave.innerHTML = "&#10004;";
        aItemCategorySave.href =
          "JavaScript:itemCategorySave(" + category.id + ")";
      }

      await displayTree(li, transaction);
    }
  } catch (err) {
    console.log(err);
    alert("Ошибка: " + err);
  }
}

window.outlayCategoryEdit = outlayCategoryEdit;

function outlayCategoryEdit() {
  if (StandbyIndicator.isShowing()) return;

  window.history.replaceState(
    {
      window_scrollY: window.scrollY,
      content: document.body.getElementsByClassName("content")[0].innerHTML
    },
    window.title
  );
  window.history.pushState({ data: "data" }, "title");

  OutlayCategoryEdit.displayData({ id: categorySelected.id });
}

window.outlayCategoryNew = outlayCategoryNew;

function outlayCategoryNew() {
  if (StandbyIndicator.isShowing()) return;

  window.history.replaceState(
    {
      window_scrollY: window.scrollY,
      content: document.body.getElementsByClassName("content")[0].innerHTML
    },
    window.title
  );
  window.history.pushState({ data: "data" }, "title");

  OutlayCategoryEdit.displayData({ parentId: categorySelected.id });
}
