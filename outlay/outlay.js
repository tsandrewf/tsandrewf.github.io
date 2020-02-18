"use strict";

import { OutlayEntry } from "./outlayEntry.js";
import { Setting } from "./setting.js";
import { openDb, outlayDateSelectedKeyName } from "./db.js";
import { Category } from "./category.js";

//let dateBeg = null;

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

async function displayData(dateBeg, dateEnd) {
  function appendRowNewMonth(date) {
    let row = document.createElement("TR");
    outlayTBody.appendChild(row);
    row.style.backgroundColor = "grey";
    row.style.color = "white";
    let td = document.createElement("TD");
    row.appendChild(td);
    td.innerHTML = date._getMonthString() + " " + date.getFullYear() + "г.";
    td.innerHTML = td.innerHTML.charAt(0).toUpperCase() + td.innerHTML.slice(1);
    td.colSpan = 4;
  }

  const outlayTBody = document
    .getElementById("outlayTable")
    .getElementsByTagName("TBODY")[0];

  let monthNumRem = null;

  {
    let entryYoungest = await OutlayEntry.getEntryYoungest();

    if (!dateBeg) {
      dateBeg = entryYoungest ? entryYoungest.date : new Date();
      dateBeg = dateBeg._getMonthBeg();

      dateBeg.setDate(dateBeg.getDate() - 1);
      dateBeg = dateBeg._getMonthBeg();

      dateBeg.setDate(dateBeg.getDate() - 1);
      dateBeg = dateBeg._getMonthBeg();
    }

    if (outlayTBody.rows.length) {
      let row = outlayTBody.rows[outlayTBody.rows.length - 1];
      row.onclick = null;
      row.style.cursor = null;
      let td = row.getElementsByTagName("TD")[0];
      td.innerHTML = td.innerHTML.replace(/Добавить/gi, "").trim();
      td.innerHTML =
        td.innerHTML.charAt(0).toUpperCase() + td.innerHTML.slice(1);
    } else if (entryYoungest) {
      appendRowNewMonth(entryYoungest.date);

      monthNumRem = entryYoungest.date.getMonth();
    }
  }

  let outlayEntries = await OutlayEntry.getEntries({
    dateBeg: dateBeg,
    dateEnd: dateEnd
  });
  for (let i = outlayEntries.length - 1; i >= 0; i--) {
    let outlayEntry = outlayEntries[i];
    if (null === monthNumRem) {
      monthNumRem = outlayEntry.date.getMonth();
    }

    let monthNum = outlayEntry.date.getMonth();
    if (monthNumRem !== monthNum) {
      appendRowNewMonth(outlayEntry.date);

      monthNumRem = monthNum;
    }

    // Создаем строку таблицы и добавляем ее
    let row = document.createElement("TR");
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

  let entryOlder = await OutlayEntry.getEntryOlder(dateBeg);
  if (entryOlder) {
    let dateEndNew = entryOlder.date._getMonthEnd();
    let dateBegNew = dateEndNew._getMonthBeg();

    // Создаем строку таблицы и добавляем ее
    let row = document.createElement("TR");
    outlayTBody.appendChild(row);
    row.style.backgroundColor = "grey";
    row.style.color = "white";
    row.onclick = function() {
      displayData(dateBegNew, dateEndNew);
    };
    row.style.cursor = "pointer";

    let tdAppend = document.createElement("TD");
    row.appendChild(tdAppend);
    tdAppend.innerHTML =
      "Добавить " +
      dateBegNew._getMonthString() +
      " " +
      dateBegNew.getFullYear() +
      "г.";
    tdAppend.colSpan = 4;
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
