"use strict";

import { NavbarTop } from "./navbarTop.js";
import { NavbarBottom } from "./navbarBottom.js";
import { OutlayEntry } from "./outlayEntry.js";
import { outlaySummaryPeriodKeyName } from "./db.js";
import { Category } from "./category.js";
import { Setting } from "./setting.js";
import { StandbyIndicator } from "./standbyIndicator.js";
import { OutlayUtils } from "./outlayUtils.js";
import { localeString, navbarButtons } from "./locale.js";
import { setContentHeight } from "./pattern.js";
import { paramRefresh } from "./needRefresh.js";

window.OutlayUtils_displayData = function () {
  window.history.pushState(null, "title");

  OutlayUtils.displayData();
};

let summaries;
const divOutlaySummary = document.getElementById("outlaySummary");

export class OutlaySummary {
  static getPeriod() {
    let dateBeg = new Date(document.getElementById("iptDateBeg").value);
    if (!(dateBeg instanceof Date && !isNaN(dateBeg.valueOf()))) {
      dateBeg = null;
    }

    let dateEnd = new Date(document.getElementById("iptDateEnd").value);
    if (!(dateEnd instanceof Date && !isNaN(dateEnd.valueOf()))) {
      dateEnd = null;
    }

    return {
      dateBeg: dateBeg,
      dateEnd: dateEnd,
    };
  }

  static async dateChanged() {
    await Setting.set(outlaySummaryPeriodKeyName, OutlaySummary.getPeriod());
    await OutlaySummary.summariesRefresh();
    await OutlaySummary.summaryContentRefresh(0);
  }

  static async displayData() {
    //try {
    Setting.setWindowOnload("OutlaySummary");

    window.OutlaySummary_dateChanged = OutlaySummary.dateChanged;

    NavbarTop.show({
      titleHTML: localeString._writeFromLeftToRight
        ? '<div style="display: flex;flex-direction: row;align-items: center;">' +
          '<div style="margin: 0 0.5em;">' +
          localeString.results._capitalize() +
          " " +
          "</div>" +
          '<div style="text-align:right;">' +
          localeString.from +
          " " +
          '<input type="date" id="iptDateBeg" oninput="OutlaySummary_dateChanged()" />' +
          "<br>" +
          localeString.until +
          " " +
          '<input type="date" id="iptDateEnd" oninput="OutlaySummary_dateChanged()" />' +
          "</div>" +
          "</div>"
        : '<div style="display: flex;flex-direction: row;align-items: center;">' +
          '<div style="text-align:left;">' +
          '<input type="date" id="iptDateBeg" oninput="OutlaySummary_dateChanged()" />' +
          " " +
          localeString.from +
          "<br>" +
          '<input type="date" id="iptDateEnd" oninput="OutlaySummary_dateChanged()" />' +
          " " +
          localeString.until +
          "</div>" +
          '<div style="margin: 0 0.5em;">' +
          " " +
          localeString.results._capitalize() +
          " " +
          "</div>" +
          "</div>",
      buttons: [],
    });

    NavbarBottom.setActiveButton(navbarButtons.navbarButtonSummary.href);

    setContentHeight();

    for (let div of document.querySelectorAll(".content > div")) {
      div.style.display = "none";
    }

    let datePeriod = await Setting.get(outlaySummaryPeriodKeyName);

    if (!datePeriod) {
      return;
    }

    datePeriod.dateBeg =
      "string" === typeof datePeriod.dateBeg
        ? new Date(datePeriod.dateBeg)
        : datePeriod.dateBeg;
    datePeriod.dateEnd =
      "string" === typeof datePeriod.dateEnd
        ? new Date(datePeriod.dateEnd)
        : datePeriod.dateEnd;

    if (!datePeriod) {
      let date = new Date();
      date = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      datePeriod = { dateBeg: date, dateEnd: date };
    }

    document.getElementById("iptDateBeg").value = datePeriod.dateBeg
      ? datePeriod.dateBeg._toForm()
      : null;
    document.getElementById("iptDateEnd").value = datePeriod.dateEnd
      ? datePeriod.dateEnd._toForm()
      : null;
    await Setting.set(outlaySummaryPeriodKeyName, datePeriod);

    if (paramRefresh.outlaySummary.needRefresh) {
      await OutlaySummary.summariesRefresh();
      await OutlaySummary.summaryContentRefresh(0);
    }

    divOutlaySummary.style.display = "block";
    divOutlaySummary.parentElement.scrollTop =
      paramRefresh[divOutlaySummary.id].scrollTop;
    //} catch (error) {
    //  alert(error);
    //}
  }

  static async summariesRefresh() {
    StandbyIndicator.show();

    summaries = null;
    summaries = new Map();

    let dateBeg = document.getElementById("iptDateBeg").value;
    dateBeg = dateBeg ? new Date(dateBeg) : null;
    let dateEnd = document.getElementById("iptDateEnd").value;
    dateEnd = dateEnd ? new Date(dateEnd) : null;

    if (dateBeg && dateEnd && dateBeg > dateEnd) return;

    let outlayEntries = await OutlayEntry.getEntries({
      dateBeg: dateBeg,
      dateEnd: dateEnd,
    });

    for (let entry of outlayEntries) {
      for (let i = 0; i < entry.categories.length; i++) {
        let entryItemCategoryId = entry.categories[i] ? entry.categories[i] : 0;
        let categoryId = entryItemCategoryId;
        while (true) {
          if (!summaries.has(categoryId)) {
            summaries.set(categoryId, { sumAll: 0, sumOnly: 0 });
          }
          let sumOnly = summaries.get(categoryId).sumOnly;
          if (categoryId === entryItemCategoryId) {
            sumOnly += entry.sums[i];
          }
          summaries.set(categoryId, {
            sumAll: summaries.get(categoryId).sumAll + entry.sums[i],
            sumOnly: sumOnly,
          });
          const category = await Category.get(categoryId);
          if (!category) break;
          categoryId = category.parentId;
        }
      }
    }

    StandbyIndicator.hide();

    paramRefresh.outlaySummary.needRefresh = false;
  }

  static trOnclick() {
    OutlaySummary.summaryContentRefresh(
      Number(this.getAttribute("categoryId"))
    );
  }

  static async categoryTree(category) {
    let upperCategoryArray = [];
    while (category) {
      upperCategoryArray.push(category);
      category = await Category.get(category.parentId);
    }

    let parentUl = document.createElement("UL");
    divOutlaySummary.appendChild(parentUl);
    parentUl.style = "padding-left: 0;";
    let li = document.createElement("LI");
    parentUl.appendChild(li);
    li.innerHTML = "&#9650; Корень";
    li.setAttribute("categoryId", 0);
    li.onclick = OutlaySummary.trOnclick;

    for (let category of upperCategoryArray.reverse()) {
      let ul = document.createElement("UL");
      parentUl.appendChild(ul);
      let li = document.createElement("LI");
      ul.appendChild(li);
      li.innerHTML = "&#9650; " + category.name;
      li.setAttribute("categoryId", category.id);
      li.onclick = OutlaySummary.trOnclick;
      parentUl = ul;
    }
  }

  static async summaryContentRefresh(categoryId) {
    let sumCategory = null;
    let sumAll = null;

    function trAppend(categoryName, sum, categoryId) {
      let tr = document.createElement("TR");
      tbody.appendChild(tr);
      tr.setAttribute("categoryId", categoryId);
      tr.onclick = OutlaySummary.trOnclick;

      let tdCategoryName = document.createElement("TD");
      tr.appendChild(tdCategoryName);
      tdCategoryName.id = "tdCategoryName";
      tdCategoryName.innerHTML = categoryName;

      let tdSum = document.createElement("TD");
      tr.appendChild(tdSum);
      tdSum.id = "tdSum";
      tdSum.innerHTML = sum.toFixed(2);

      let tdPercentCategory = document.createElement("TD");
      tr.appendChild(tdPercentCategory);
      tdPercentCategory.id = "tdPercentCategory";
      tdPercentCategory.innerHTML = sumCategory
        ? ((sum / sumCategory.sumAll) * 100).toFixed(0) + "%"
        : null;

      let tdPercentAll = document.createElement("TD");
      tr.appendChild(tdPercentAll);
      tdPercentAll.id = "tdPercentAll";
      tdPercentAll.innerHTML = sumAll
        ? ((sum / sumAll) * 100).toFixed(0) + "%"
        : null;
    }

    while (divOutlaySummary.firstChild) {
      divOutlaySummary.removeChild(divOutlaySummary.firstChild);
    }

    await OutlaySummary.categoryTree(await Category.get(categoryId));

    let table = document.createElement("TABLE");
    divOutlaySummary.appendChild(table);
    table.className = "tableBase";
    let tbody = document.createElement("TBODY");
    table.appendChild(tbody);

    {
      const period = OutlaySummary.getPeriod();
      if (period.dateBeg && period.dateEnd && period.dateBeg > period.dateEnd) {
        trAppend("Дата начала периода БОЛЬШЕ даты окончания", 0, categoryId);
        return;
      }
    }

    if (!summaries.size) {
      trAppend("Расходов НЕ было", 0, categoryId);
      return;
    }

    sumAll = summaries.get(0).sumAll;
    sumCategory = summaries.get(categoryId);

    trAppend("ИТОГО", sumCategory.sumAll, categoryId);

    {
      const categoryName = categoryId
        ? (await Category.get(categoryId)).name
        : "Корень";
      if (sumCategory.sumOnly) {
        trAppend(categoryName, sumCategory.sumOnly, categoryId);
      }
    }

    let categories = await Category.getChildren(categoryId);
    for (let category of categories) {
      let sum = summaries.get(category.id);
      if (sum) {
        trAppend(category.name, sum.sumAll, category.id);
      }
    }
  }
}
