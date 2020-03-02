"use strict";

import { OutlayEntry } from "./outlayEntry.js";
import { outlaySummaryPeriodKeyName } from "./db.js";
import { Category } from "./category.js";
import { Setting } from "./setting.js";
import { StandbyIndicator } from "./standbyIndicator.js";

let summaries;
let summaryContent;

//window.OutlaySummary_dateChanged = OutlaySummary.dateChanged;

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
      dateEnd: dateEnd
    };
  }

  //window.dateChanged = dateChanged;

  static async dateChanged() {
    await Setting.set(outlaySummaryPeriodKeyName, OutlaySummary.getPeriod());
    await OutlaySummary.summariesRefresh();
    await OutlaySummary.summaryContentRefresh(0);
  }

  //window.onload = openDb(window_onload);

  static async displayData() {
    //try {
    window.OutlaySummary_dateChanged = OutlaySummary.dateChanged;
    document.title = "Итоги";

    NavbarTop.show({
      menu: {
        buttonHTML: "&#9776;",
        content: [
          { innerHTML: "Чеки", href: 'Javascript:displayData("Outlay")' },
          {
            innerHTML: "Категории расходов",
            href: 'Javascript:displayData("OutlayCategory")'
          }
        ]
      },
      titleHTML:
        '<div style="display: flex;flex-direction: row;align-items: center;"><div style="margin: 0 0.5em;">Итоги </div><div style="text-align:right;">с <input type="date" id="iptDateBeg" oninput="OutlaySummary_dateChanged()" /><br>по <input type="date" id="iptDateEnd" oninput="OutlaySummary_dateChanged()" /></div></div>',
      buttons: []
    });

    NavbarBottom.show([
      { text: "Чеки", href: 'Javascript:displayData("Outlay")' },
      { text: "Категории", href: 'Javascript:displayData("OutlayCategory")' },
      { text: "Итоги" }
    ]);

    {
      const divContent = document.getElementsByClassName("content")[0];

      while (divContent.firstChild) {
        divContent.removeChild(divContent.firstChild);
      }
    }

    //summaryContent = document.getElementById("summaryContent");
    summaryContent = document.getElementsByClassName("content")[0];

    let datePeriod = await Setting.get(outlaySummaryPeriodKeyName);
    if (!datePeriod) {
      let date = new Date();
      date = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      console.log("date", date);
      datePeriod = { dateBeg: date, dateEnd: date };
    }

    document.getElementById("iptDateBeg").value = datePeriod.dateBeg
      ? datePeriod.dateBeg._toForm()
      : null;
    document.getElementById("iptDateEnd").value = datePeriod.dateEnd
      ? datePeriod.dateEnd._toForm()
      : null;
    await Setting.set(outlaySummaryPeriodKeyName, datePeriod);

    await OutlaySummary.summariesRefresh();

    await OutlaySummary.summaryContentRefresh(0);
    //} catch (error) {
    //  alert(error);
    //}
  }

  /*function sleep(millis) {
  var t = new Date().getTime();
  var i = 0;
  while (new Date().getTime() - t < millis) {
    i++;
  }
}*/

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
      dateEnd: dateEnd
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
            sumOnly: sumOnly
          });
          const category = await Category.get(categoryId);
          if (!category) break;
          categoryId = category.parentId;
        }
      }
    }

    //sleep(2000);
    StandbyIndicator.hide();
  }

  //window.trOnclick = trOnclick;

  static trOnclick(elem) {
    OutlaySummary.summaryContentRefresh(
      Number(elem.getAttribute("categoryId"))
    );
  }

  static async categoryTree(category) {
    let upperCategoryArray = [];
    while (category) {
      upperCategoryArray.push(category);
      category = await Category.get(category.parentId);
    }

    let parentUl = document.createElement("UL");
    summaryContent.appendChild(parentUl);
    parentUl.style = "padding-left: 0;";
    let li = document.createElement("LI");
    parentUl.appendChild(li);
    li.innerHTML = "&#9650; Корень";
    li.setAttribute("categoryId", 0);
    li.onclick = function() {
      OutlaySummary.trOnclick(this);
    };
    for (let category of upperCategoryArray.reverse()) {
      let ul = document.createElement("UL");
      parentUl.appendChild(ul);
      let li = document.createElement("LI");
      ul.appendChild(li);
      li.innerHTML = "&#9650; " + category.name;
      li.setAttribute("categoryId", category.id);
      li.onclick = function() {
        trOnclick(this);
      };
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
      tr.onclick = function() {
        OutlaySummary.trOnclick(this);
      };

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

    while (summaryContent.firstChild) {
      summaryContent.removeChild(summaryContent.firstChild);
    }

    await OutlaySummary.categoryTree(await Category.get(categoryId));

    let table = document.createElement("TABLE");
    summaryContent.appendChild(table);
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
