"use strict";

import { OutlayEntry } from "./outlayEntry.js";
import { openDb } from "./db.js";
import { Category } from "./category.js";

let summaries;
let summaryContent;

window.dateChanged = dateChanged;

function dateChanged() {
  console.log("dateChanged");
}

window.onload = openDb(window_onload);

async function window_onload() {
  summaryContent = document.getElementById("summaryContent");

  await summariesRefresh();

  await summaryContentRefresh(0);
}

async function summariesRefresh() {
  summaries = null;
  summaries = new Map();
  let outlayEntries = await OutlayEntry.getEntries();
  console.log("outlayEntries", outlayEntries);
  for (let entry of outlayEntries) {
    for (let i = 0; i < entry.categories.length; i++) {
      console.log("entry.sums[" + i + "]", entry.sums[i]);
      let categoryId = entry.categories[i] ? entry.categories[i] : 0;
      while (true) {
        if (!summaries.has(categoryId)) {
          summaries.set(categoryId, 0);
        }
        summaries.set(categoryId, summaries.get(categoryId) + entry.sums[i]);
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
    tdPercentCategory.innerHTML = ((sum / sumCategory) * 100).toFixed(0) + "%";

    let tdPercentAll = document.createElement("TD");
    tr.appendChild(tdPercentAll);
    tdPercentAll.id = "tdPercentAll";
    tdPercentAll.innerHTML = ((sum / sumAll) * 100).toFixed(0) + "%";
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

  const sumAll = summaries.get(0);
  const sumCategory = summaries.get(categoryId);

  trAppend("ИТОГО", sumCategory, categoryId);

  {
    let sum = summaries.get(categoryId);
    if (sum) {
      trAppend("category.name", sum, categoryId);
    }
  }

  let categories = await Category.getChildren(categoryId);
  for (let category of categories) {
    let sum = summaries.get(category.id);
    if (sum) {
      trAppend(category.name, sum, category.id);
    }
  }
}
