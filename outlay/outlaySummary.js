"use strict";

import { OutlayEntry } from "./outlayEntry.js";
import {
  openDb,
  outlaySummaryPeriodKeyName,
  settingObjectStoreName
} from "./db.js";
import { Category } from "./category.js";
import { Setting } from "./setting.js";

let summaries;
let summaryContent;

window.dateChanged = dateChanged;

async function dateChanged() {
  let dateBeg = new Date(document.getElementById("iptDateBeg").value);
  if (!(dateBeg instanceof Date && !isNaN(dateBeg.valueOf()))) {
    dateBeg = null;
  }

  let dateEnd = new Date(document.getElementById("iptDateEnd").value);
  if (!(dateEnd instanceof Date && !isNaN(dateEnd.valueOf()))) {
    dateEnd = null;
  }

  await Setting.set(outlaySummaryPeriodKeyName, {
    dateBeg: dateBeg,
    dateEnd: dateEnd
  });

  await summariesRefresh();
  await summaryContentRefresh(0);
}

window.onload = openDb(window_onload);

async function window_onload() {
  summaryContent = document.getElementById("summaryContent");

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

  await summariesRefresh();

  await summaryContentRefresh(0);
}

async function summariesRefresh() {
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
}

window.trOnclick = trOnclick;

function trOnclick(elem) {
  summaryContentRefresh(Number(elem.getAttribute("categoryId")));
}

async function categoryTree(category) {
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
  li.innerHTML = "Корень";
  li.setAttribute("categoryId", 0);
  li.onclick = function() {
    trOnclick(this);
  };
  for (let category of upperCategoryArray.reverse()) {
    let ul = document.createElement("UL");
    parentUl.appendChild(ul);
    let li = document.createElement("LI");
    ul.appendChild(li);
    li.innerHTML = category.name;
    li.setAttribute("categoryId", category.id);
    li.onclick = function() {
      trOnclick(this);
    };
    parentUl = ul;
  }
}

async function summaryContentRefresh(categoryId) {
  let sumCategory = null;
  let sumAll = null;

  function trAppend(categoryName, sum, categoryId) {
    let tr = document.createElement("TR");
    tbody.appendChild(tr);
    tr.setAttribute("categoryId", categoryId);
    tr.onclick = function() {
      trOnclick(this);
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

  await categoryTree(await Category.get(categoryId));

  let table = document.createElement("TABLE");
  summaryContent.appendChild(table);
  table.className = "tableBase";
  let tbody = document.createElement("TBODY");
  table.appendChild(tbody);

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
