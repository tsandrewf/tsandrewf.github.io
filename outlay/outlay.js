"use strict";

import { OutlayEntry } from "./outlayEntry.js";
import { Setting } from "./setting.js";
import { openDb, outlayDateSelectedKeyName } from "./db.js";
import { Category } from "./category.js";

window.outlayEntryNew = outlayEntryNew;

async function outlayEntryNew() {
  let date = await Setting.get(outlayDateSelectedKeyName);
  let outlayEntryId = await OutlayEntry.set({
    date: date,
    categories: [null],
    sums: [null]
  });

  location.href = "outlayEntryEdit.html?id=" + outlayEntryId;
}

window.onload = openDb(displayData);

async function displayData() {
  const outlayTBody = document
    .getElementById("outlayTable")
    .getElementsByTagName("TBODY")[0];

  let outlayEntries = await OutlayEntry.getEntries();
  for (let i = outlayEntries.length - 1; i >= 0; i--) {
    let outlayEntry = outlayEntries[i];

    // Создаем строку таблицы и добавляем ее
    let row = document.createElement("TR");
    row.className = "odd";
    outlayTBody.appendChild(row);

    // Создаем ячейки в вышесозданной строке и добавляем тх
    let tdDate = document.createElement("TD");
    let tdCategory = document.createElement("TD");
    let tdSum = document.createElement("TD");
    let tdDel = document.createElement("TD");

    row.appendChild(tdDate);
    row.appendChild(tdCategory);
    row.appendChild(tdSum);
    row.appendChild(tdDel);

    // Наполняем ячейки
    tdDate.innerHTML =
      outlayEntry.date && outlayEntry.date instanceof Date
        ? outlayEntry.date._toStringBrief()
        : "НЕ задана";
    let category = await Category.get(outlayEntry.categoryId);
    tdCategory.innerHTML = category ? category.name : null;
    tdSum.innerHTML =
      '<a href="outlayEntryEdit.html?id=' +
      outlayEntry.id +
      '">' +
      (outlayEntry.sumAll ? outlayEntry.sumAll.toFixed(2) : "НЕ задана") +
      "</a>";
    tdDel.innerHTML =
      '<a href="Javascript:outlayEntryDelete(' +
      outlayEntry.id +
      ')">&#10006</a>';

    tdDate.id = "colDate";
    tdCategory.id = "colCategory";
    tdSum.id = "colSum";
    tdDel.id = "colDel";
  }
}

window.outlayEntryDelete = outlayEntryDelete;

async function outlayEntryDelete(key) {
  if (!window.confirm("Вы действительно хотите удалить чек?")) {
    return;
  }

  try {
    await OutlayEntry.delete(key);
    document.location.reload(true);
  } catch (error) {
    alert(error);
  }
}
