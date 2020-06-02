"use strict";

import { NavbarTop } from "./navbarTop.js";
import { NavbarBottom } from "./navbarBottom.js";
import { Category } from "./category.js";
import { Setting } from "./setting.js";
import { StandbyIndicator } from "./standbyIndicator.js";
import { retValKeyName, categoryHtmlKeyName } from "./db.js";
import { OutlayUtils } from "./outlayUtils.js";
import { historyLengthIncreaseSet } from "./outlay.js";
import { localeString, navbarButtons } from "./locale.js";
import { setContentHeight } from "./pattern.js";

import {
  db,
  outlayCategoryObjectStoreName,
  settingObjectStoreName,
  outlayObjectStoreName,
  outlayCategorySelectedKeyName,
} from "./db.js";

window.OutlayUtils_displayData = function () {
  window.history.pushState(null, "title");

  OutlayUtils.displayData();
};

let needCategorySave;
let divContent;

export const expanded = String.fromCharCode(9650);
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
    if (needCategorySave) {
      spanName.innerHTML += " ";
      let aItemCategorySave = document.createElement("A");
      li.appendChild(aItemCategorySave);
      aItemCategorySave.innerHTML = "&#10004;";
      aItemCategorySave.href =
        "JavaScript:OutlayCategory_itemCategorySave(" + category.id + ")";
    }

    return ul;
  }

  static categorySelectedMark(categoryId) {
    for (let liCategory of divContent.getElementsByClassName(
      "selectedCategory"
    )) {
      liCategory.classList.remove("selectedCategory");
    }

    if ("number" == (typeof categoryId).toLowerCase()) {
      categorySelected = document.getElementById(categoryId);
      if (!categorySelected) {
        categorySelected = document.getElementById("0");
      }
    } else if (
      "object" == (typeof categoryId).toLowerCase() &&
      "LI" === categoryId.tagName.toUpperCase()
    ) {
      categorySelected = categoryId;
    }

    categorySelected
      .getElementsByTagName("SPAN")[1]
      .classList.add("selectedCategory");
  }

  static async itemCategorySave(categoryId) {
    await Setting.set(retValKeyName, categoryId);
    await Setting.set(categoryHtmlKeyName, {
      content: divContent.innerHTML,
      divContent_scrollTop: divContent.scrollTop,
    });

    history.back();
  }

  static async outlayCategoryDel() {
    if (StandbyIndicator.isShowing()) return;

    try {
      if (!categorySelected) {
        throw Error(localeString.noCategorySelected._capitalize());
      }

      let categorySelectedId = Number(categorySelected.id);

      if (0 === categorySelectedId) {
        throw Error(localeString.impossibleToDeleteRootCategory._capitalize());
      }

      if (!window.confirm(localeString.confirmCategoryDelete._capitalize())) {
        return;
      }

      let transaction = db.transaction(
        [
          outlayCategoryObjectStoreName,
          settingObjectStoreName,
          outlayObjectStoreName,
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
            localeString.categoryCanNotBeDeleted._capitalize() +
              ", " +
              localeString.since +
              " " +
              categoryIsUsedReason
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
              localeString.categoryCanNotBeDeleted._capitalize() +
                ". " +
                localeString.thisCategoryHasSubcategory._capitalize() +
                " " +
                '"' +
                categoryDescendant.name +
                '", ' +
                localeString.and +
                " " +
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

        await Setting.set(categoryHtmlKeyName, {
          content: divContent.innerHTML,
          divContent_scrollTop: divContent.scrollTop,
        });
      }

      transaction.onerror = function (event) {
        console.log("onerror");
      };

      transaction.onabort = function () {
        console.log("onabort");
      };

      transaction.oncomplete = function () {
        console.log("oncomplete");
      };
    } catch (error) {
      alert(error.message);
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

  static async displayData(options) {
    needCategorySave = options;
    //try {
    if (!needCategorySave) {
      await Setting.set(categoryHtmlKeyName, null);

      Setting.setWindowOnload("OutlayCategory");
    }

    StandbyIndicator.show();

    await Setting.set(retValKeyName, null);

    window.OutlayCategory_itemCategorySave = OutlayCategory.itemCategorySave;

    {
      let hideSaveCSS = document.getElementById("hideSaveCSS");
      if (!needCategorySave && !hideSaveCSS) {
        hideSaveCSS = document.createElement("style");
        document.head.append(hideSaveCSS);
        hideSaveCSS.innerHTML = "li a {display:none;}";
        hideSaveCSS.id = "hideSaveCSS";
      } else if (needCategorySave && hideSaveCSS) {
        document.head.removeChild(hideSaveCSS);
      }
    }

    document.title = localeString.categories._capitalize();

    NavbarTop.show({
      back: needCategorySave ? localeString.check._capitalize() : null,
      titleHTML: localeString.categories._capitalize(),
      buttons: [
        {
          onclick: OutlayCategory.outlayCategoryNew,
          title: localeString.addCategory._capitalize(),
          innerHTML: "&#10010;",
        },
        {
          onclick: OutlayCategory.outlayCategoryEdit,
          title: localeString.categoryNameEdit._capitalize(),
          innerHTML: "&#9999;",
        },
        {
          onclick: OutlayCategory.outlayCategoryDel,
          title: localeString.categoryDelete._capitalize(),
          innerHTML: "&#10006;",
        },
      ],
    });

    NavbarBottom.setActiveButton(
      !needCategorySave ? navbarButtons.navbarButtonCategory.href : null
    );

    divContent = document.getElementsByClassName("content")[0];
    {
      while (divContent.firstChild) {
        divContent.removeChild(divContent.firstChild);
      }
    }

    let categorySelectedId = await Setting.get(outlayCategorySelectedKeyName);
    if (!categorySelectedId) categorySelectedId = 0;

    const contentRem =
      window.history.state || (await Setting.get(categoryHtmlKeyName));

    if (contentRem && contentRem.content) {
      divContent.innerHTML = contentRem.content;
      divContent.scrollTop = contentRem.divContent_scrollTop;

      const categorySel = await Category.get(categorySelectedId);
      const liCategory = document.getElementById(categorySelectedId);
      const categoryName = liCategory.childNodes[1].innerHTML.trim();

      if (categorySel && categorySel.name !== categoryName) {
        liCategory.childNodes[1].innerHTML = " " + categorySel.name;
        const ulCategory = liCategory.parentElement;
        const parentNode = ulCategory.parentElement;
        parentNode.removeChild(ulCategory);
        let ulCategoryChilds = Array.from(parentNode.childNodes).filter(
          (node) => "UL" === node.tagName
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
          (node) => "UL" === node.tagName
        );
        if (categoryChildren.length !== ulCategoryChilds.length) {
          for (let i = 0; i < categoryChildren.length; i++) {
            const category = categoryChildren[i];
            if (!ulCategoryChilds[i]) {
              liCategory.appendChild(
                OutlayCategory.getNodeCategoryNew(category)
              );
              OutlayCategory.liExpand(liCategory);
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
      divContent.appendChild(
        await OutlayCategory.displayTree(
          null,
          db.transaction(outlayCategoryObjectStoreName)
        )
      );
    }

    OutlayCategory.categorySelectedMark(categorySelectedId);

    if (window.history.state) {
      divContent.scrollTop = contentRem.divContent_scrollTop;
      window.history.replaceState(null, window.title);
    } else if (contentRem) {
      divContent.scrollTop = contentRem.divContent_scrollTop;
    }

    for (let li of document.body
      .getElementsByClassName("content")[0]
      .getElementsByTagName("LI")) {
      li.childNodes[0].onclick = OutlayCategory.leaf_expand_onclick;
      li.childNodes[1].onclick = OutlayCategory.leaf_name_onclick;
    }
    //} catch (error) {
    //  alert(error.stack);
    //} finally {
    setContentHeight();

    StandbyIndicator.hide();
    //}
  }

  static leaf_name_onclick() {
    OutlayCategory.liOnClick(this.parentElement);
    return false;
  }

  static leaf_expand_onclick() {
    OutlayCategory.leafChange(this);
  }

  static async displayTree(node, transaction, expandedAll) {
    //try {
    //let nodeId = Number(node.id);
    //let nodeId;
    //let ulRoot;
    if (true !== expandedAll) expandedAll = false;

    let ulRoot;
    if (!node) {
      ulRoot = document.createElement("UL");
      ulRoot.className = "category";
      ulRoot.setAttribute("expanded", "true");
      ulRoot.style.paddingLeft = "0";
      const liRoot = document.createElement("LI");
      liRoot.id = "0";
      ulRoot.appendChild(liRoot);
      const spanExpanded = document.createElement("SPAN");
      spanExpanded.innerHTML = expanded;
      liRoot.appendChild(spanExpanded);
      const spanCategoryName = document.createElement("SPAN");
      spanCategoryName.innerHTML = localeString.root._capitalize();
      spanCategoryName.onclick = OutlayCategory.leaf_name_onclick;
      liRoot.appendChild(spanCategoryName);

      node = liRoot;
    }

    let nodeId = Number(node.id);

    let i = 0;
    let ul;

    for (let category of await Category.getChildren(nodeId, transaction)) {
      category.expanded = category.expanded || expandedAll;

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

      await OutlayCategory.displayTree(li, transaction, expandedAll);
    }
    //} catch (error) {
    //  alert(error.stack);
    //}
    return ulRoot;
  }

  static outlayCategoryEdit() {
    if (0 === Number(categorySelected.id)) {
      alert(localeString.rootCategoryCanNotBeChanged._capitalize());
      return;
    }

    if (StandbyIndicator.isShowing()) return;

    window.history.replaceState(
      {
        url: "OutlayCategory",
        divContent_scrollTop: divContent.scrollTop,
        content: divContent.innerHTML,
      },
      window.title
    );

    historyLengthIncreaseSet();
    location.href = "#func=OutlayCategoryEdit&id=" + categorySelected.id;
  }

  static outlayCategoryNew() {
    if (StandbyIndicator.isShowing()) return;

    window.history.replaceState(
      {
        url: "OutlayCategory",
        divContent_scrollTop: divContent.scrollTop,
        content: divContent.innerHTML,
      },
      window.title
    );

    historyLengthIncreaseSet();
    location.href = "#func=OutlayCategoryEdit&parentId=" + categorySelected.id;
  }
}
