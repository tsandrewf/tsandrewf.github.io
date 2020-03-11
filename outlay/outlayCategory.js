"use strict";

import { NavbarTop } from "./navbarTop.js";
import { NavbarBottom } from "./navbarBottom.js";
import { Category } from "./category.js";
import { Setting } from "./setting.js";
import { StandbyIndicator } from "./standbyIndicator.js";
import { OutlayCategoryEdit } from "./outlayCategoryEdit.js";
import { retValKeyName } from "./db.js";
import { OutlayBackup } from "./outlayBackup.js";

import {
  db,
  windowOnloadKeyName,
  outlayCategoryObjectStoreName,
  settingObjectStoreName,
  outlayObjectStoreName,
  outlayCategorySelectedKeyName
} from "./db.js";

window.OutlayBackup_displayData = function() {
  window.history.pushState(null, "title");

  OutlayBackup.displayData();
};

let entryId;

const expanded = String.fromCharCode(9650);
const compressed = String.fromCharCode(9660);

let categorySelected;

export class OutlayCategory {
  static getNodeCategoryNew(category) {
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
      aItemCategorySave.href =
        "JavaScript:OutlayCategory_itemCategorySave(" + category.id + ")";
    }

    return ul;
  }

  static categorySelectedMark(categorySel) {
    if (categorySelected) {
      categorySelected
        .getElementsByTagName("SPAN")[1]
        .classList.remove("selectedCategory");
    }

    if ("number" == (typeof categorySel).toLowerCase()) {
      categorySelected = document.getElementById(categorySel);
    } else if ("object" == (typeof categorySel).toLowerCase()) {
      if ("LI" === categorySel.tagName.toUpperCase()) {
        categorySelected = categorySel;
      }
    }

    categorySelected
      .getElementsByTagName("SPAN")[1]
      .classList.add("selectedCategory");
  }

  static async itemCategorySave(categoryId) {
    await Setting.set(retValKeyName, categoryId);

    history.back();
  }

  static async outlayCategoryDel() {
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

        Setting.set(
          outlayCategorySelectedKeyName,
          categorySelNewId,
          transaction
        );
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

        OutlayCategory.categorySelectedMark(categorySelNewId);
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
    }
  }

  static leafChange(elem) {
    if (StandbyIndicator.isShowing()) return;

    let li = elem.parentElement;
    OutlayCategory.liOnClick(li);
    switch (elem.innerHTML) {
      case expanded:
        OutlayCategory.liCompress(li);
        break;
      case compressed:
        OutlayCategory.liExpand(li);
        break;
      default:
        console.log("I don't know: " + elem.innerText);
        break;
    }
  }

  static async liCompress(elem) {
    await Category.setExpanded(Number(elem.id), false);

    elem.getElementsByTagName("SPAN")[0].innerHTML = compressed;
    for (let child of elem.children) {
      if ("UL" === child.tagName.toUpperCase()) child.style.display = "none";
    }
  }

  static async liExpand(elem) {
    await Category.setExpanded(Number(elem.id), true);

    elem.getElementsByTagName("SPAN")[0].innerHTML = expanded;
    for (let child of elem.children) {
      if ("UL" === child.tagName.toUpperCase()) child.style.display = null;
    }
  }

  static async liOnClick(liCategory) {
    if (StandbyIndicator.isShowing()) return;

    if (liCategory === categorySelected) return;

    OutlayCategory.categorySelectedMark(liCategory);

    await Setting.set(outlayCategorySelectedKeyName, Number(liCategory.id));
  }

  static async displayData(id) {
    entryId = id;
    try {
      if (!entryId) {
        const funcName = "OutlayCategory";
        if (funcName !== (await Setting.get(windowOnloadKeyName))) {
          await Setting.set(windowOnloadKeyName, funcName);
        }
      }

      StandbyIndicator.show();

      await Setting.set(retValKeyName, null);

      window.OutlayCategory_itemCategorySave = OutlayCategory.itemCategorySave;

      if (!entryId) {
        let hideSave = document.createElement("style");
        document.head.append(hideSave);
        hideSave.innerHTML = "li a {display:none;}";
      }

      document.title = "Категории расходов";

      NavbarTop.show({
        menu: {
          buttonHTML: "&#9776;",
          content: [
            {
              innerHTML: "Категории расходов",
              href: "Javascript:OutlayCategory_displayData()"
            },
            {
              innerHTML: "Итоги в разрезе категорий",
              href: "Javascript:OutlaySummary_displayData()"
            },
            {
              innerHTML: "Архивирование и восстановление",
              href: "Javascript:OutlayBackup_displayData();"
            }
          ]
        },
        titleHTML: "Категории расходов",
        buttons: [
          {
            onclick: OutlayCategory.outlayCategoryNew,
            title: "Добавить категорию",
            innerHTML: "&#10010;"
          },
          {
            onclick: OutlayCategory.outlayCategoryEdit,
            title: "Изменить название категории",
            innerHTML: "&#9999;"
          },
          {
            onclick: OutlayCategory.outlayCategoryDel,
            title: "Удалить категорию",
            innerHTML: "&#10006;"
          }
        ]
      });

      NavbarBottom.show([
        { text: "Чеки", href: "Javascript:OutlayEntries_displayData()" },
        { text: "Категории" },
        { text: "Итоги", href: "Javascript:OutlaySummary_displayData()" }
      ]);

      {
        const divContent = document.getElementsByClassName("content")[0];

        while (divContent.firstChild) {
          divContent.removeChild(divContent.firstChild);
        }
      }

      let categorySelectedId = await Setting.get(outlayCategorySelectedKeyName);
      if (!categorySelectedId) categorySelectedId = 0;

      if (window.history.state && window.history.state.content) {
        document.getElementsByClassName("content")[0].innerHTML =
          window.history.state && window.history.state.content;

        const categorySel = await Category.get(categorySelectedId);
        const liCategory = document.getElementById(categorySelectedId);
        const categoryName = liCategory.childNodes[1].innerHTML.trim();
        if (categorySel && categorySel.name !== categoryName) {
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
          const categoryChildren = await Category.getChildren(
            categorySelectedId
          );
          let ulCategoryChilds = Array.from(liCategory.childNodes).filter(
            node => "UL" === node.tagName
          );
          if (categoryChildren.length !== ulCategoryChilds.length) {
            for (let i = 0; i < categoryChildren.length; i++) {
              const category = categoryChildren[i];
              if (!ulCategoryChilds[i]) {
                liCategory.appendChild(
                  OutlayCategory.getNodeCategoryNew(category)
                );
                liExpand(liCategory);
              } else if (ulCategoryChilds[i].firstChild.id != category.id) {
                liCategory.insertBefore(
                  OutlayCategory.getNodeCategoryNew(category),
                  ulCategoryChilds[i]
                );
                OutlayCategory.liExpand(liCategory);
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
        spanCategoryName.onclick = OutlayCategory.leaf_name_onclick;
        liRoot.appendChild(spanCategoryName);
        await OutlayCategory.displayTree(
          liRoot,
          db.transaction(outlayCategoryObjectStoreName)
        );
        document
          .getElementsByClassName("content")
          .item(0)
          .appendChild(ulRoot);
      }

      OutlayCategory.categorySelectedMark(categorySelectedId);

      if (window.history.state) {
        window.scrollTo(0, window.history.state.window_scrollY);
        window.history.replaceState(null, window.title);
      }

      for (let li of document.body
        .getElementsByClassName("content")[0]
        .getElementsByTagName("LI")) {
        li.childNodes[0].onclick = OutlayCategory.leaf_expand_onclick;
        li.childNodes[1].onclick = OutlayCategory.leaf_name_onclick;
      }
    } catch (error) {
      alert(error);
    } finally {
      StandbyIndicator.hide();
    }
  }

  static leaf_name_onclick() {
    OutlayCategory.liOnClick(this.parentElement);
    return false;
  }

  static leaf_expand_onclick() {
    OutlayCategory.leafChange(this);
  }

  static async displayTree(node, transaction) {
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
        spanName.innerHTML += " ";
        let aItemCategorySave = document.createElement("A");
        li.appendChild(aItemCategorySave);
        aItemCategorySave.innerHTML = "&#10004;";
        aItemCategorySave.href =
          "JavaScript:OutlayCategory_itemCategorySave(" + category.id + ")";

        await OutlayCategory.displayTree(li, transaction);
      }
    } catch (err) {
      alert("Ошибка: " + err);
    }
  }

  static outlayCategoryEdit() {
    if (StandbyIndicator.isShowing()) return;

    window.history.replaceState(
      {
        url: "OutlayCategory",
        window_scrollY: window.scrollY,
        content: document.body.getElementsByClassName("content")[0].innerHTML
      },
      window.title,
      "#func=OutlayCategory&entryId=" + entryId
    );
    window.history.pushState({ data: "data" }, "title");

    OutlayCategoryEdit.displayData({ id: categorySelected.id });
  }

  static outlayCategoryNew() {
    if (StandbyIndicator.isShowing()) return;

    window.history.replaceState(
      {
        url: "OutlayCategory",
        window_scrollY: window.scrollY,
        content: document.body.getElementsByClassName("content")[0].innerHTML
      },
      window.title,
      "#func=OutlayCategory&entryId=" + entryId
    );
    window.history.pushState({ data: "data" }, "title");

    OutlayCategoryEdit.displayData({ parentId: categorySelected.id });
  }
}
