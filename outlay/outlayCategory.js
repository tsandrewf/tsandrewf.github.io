"use strict";

import { NavbarTop } from "./navbarTop.js";
import { NavbarBottom } from "./navbarBottom.js";
import { Category } from "./category.js";
import { Setting } from "./setting.js";
import { StandbyIndicator } from "./standbyIndicator.js";
import { retValKeyName, categoryHtmlKeyName } from "./db.js";
import { OutlayUtils } from "./outlayUtils.js";
import { historyLengthIncreaseSet, liCategoryPattern } from "./outlay.js";
import { localeString, navbarButtons } from "./locale.js";
import { setContentHeight } from "./pattern.js";
import { paramRefresh } from "./needRefresh.js";

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
const divOutlayCategory = document.getElementById("outlayCategory");

export const expanded = String.fromCharCode(9650);
export const compressed = String.fromCharCode(9660);

let categorySelected;

export class OutlayCategory {
  static getNodeCategoryNew(category) {
    const li = liCategoryPattern.cloneNode(true);

    let child = li.firstChild;
    child.innerHTML = category.expanded ? expanded : compressed;
    child.onclick = OutlayCategory.leafChange;

    child = child.nextSibling;
    child.innerHTML = category.name;
    child.onclick = OutlayCategory.liNameOnClick;

    child = child.nextSibling;
    child.onclick = OutlayCategory.itemCategorySave;

    li.id = category.id;

    return li;
  }

  static categorySelectedMark(categoryId) {
    for (let liCategory of divOutlayCategory.getElementsByClassName(
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

  static async itemCategorySave() {
    await Setting.set(retValKeyName, Number(this.parentElement.id));
    await Setting.set(categoryHtmlKeyName, {
      content: divOutlayCategory.innerHTML,
      scrollTop: divOutlayCategory.parentElement.scrollTop,
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
          content: divOutlayCategory.innerHTML,
          scrollTop: divOutlayCategory.parentElement.scrollTop,
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

  static leafChange() {
    if (StandbyIndicator.isShowing()) return;

    const li = event.target.parentElement;
    OutlayCategory.liNameOnClick();
    switch (event.target.innerHTML) {
      case expanded:
        OutlayCategory.liCompress(li);
        break;
      case compressed:
        OutlayCategory.liExpand(li);
        break;
      default:
        console.log("I don't know: " + event.target.innerText);
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

  static async liNameOnClick() {
    if (StandbyIndicator.isShowing()) return;
    const liCategory = event.target.parentElement;

    if (liCategory === categorySelected) return;

    OutlayCategory.categorySelectedMark(liCategory);

    await Setting.set(outlayCategorySelectedKeyName, Number(liCategory.id));
  }

  static async displayData(options) {
    needCategorySave = options;

    if (!needCategorySave) {
      await Setting.set(categoryHtmlKeyName, null);

      Setting.setWindowOnload("OutlayCategory");
    }

    await Setting.set(retValKeyName, null);

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

    setContentHeight();

    for (let div of document.querySelectorAll(".content > div")) {
      div.style.display = "none";
    }

    let categorySelectedId = await Setting.get(outlayCategorySelectedKeyName);
    if (!categorySelectedId) categorySelectedId = 0;

    if (paramRefresh.outlayCategory.needRefresh) {
      // Beg refresh
      StandbyIndicator.show();
      {
        while (divOutlayCategory.firstChild) {
          divOutlayCategory.removeChild(divOutlayCategory.firstChild);
        }
      }

      const timeBeg = Date.now();
      divOutlayCategory.appendChild(
        await OutlayCategory.displayTree(
          null,
          db.transaction(outlayCategoryObjectStoreName)
        )
      );

      OutlayCategory.categorySelectedMark(categorySelectedId);
      console.log(Date.now() - timeBeg);

      StandbyIndicator.hide();
      // End refresh
    }

    divOutlayCategory.style.display = "block";
    divOutlayCategory.parentElement.scrollTop =
      paramRefresh[divOutlayCategory.id].scrollTop;
    paramRefresh.outlayCategory.needRefresh = false;
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
      const spanExpand = document.createElement("SPAN");
      spanExpand.innerHTML = expanded;
      spanExpand.onclick = OutlayCategory.leafChange;

      liRoot.appendChild(spanExpand);
      const spanCategoryName = document.createElement("SPAN");
      spanCategoryName.innerHTML = localeString.root._capitalize();
      spanCategoryName.onclick = OutlayCategory.liNameOnClick;

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

      const li = OutlayCategory.getNodeCategoryNew(category);
      ul.appendChild(li);

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
      },
      window.title
    );

    paramRefresh[divOutlayCategory.id].scrollTop =
      divOutlayCategory.parentElement.scrollTop;

    historyLengthIncreaseSet();
    location.href = "#func=OutlayCategoryEdit&id=" + categorySelected.id;
  }

  static outlayCategoryNew() {
    if (StandbyIndicator.isShowing()) return;

    window.history.replaceState(
      {
        url: "OutlayCategory",
      },
      window.title
    );

    paramRefresh[divOutlayCategory.id].scrollTop =
      divOutlayCategory.parentElement.scrollTop;

    historyLengthIncreaseSet();
    location.href = "#func=OutlayCategoryEdit&parentId=" + categorySelected.id;
  }
}
