"use strict";

import { openDb, outlayDateSelectedKeyName } from "./db.js";
import { Category } from "./category.js";
import { OutlayEntry } from "./outlayEntry.js";
import { getQueryVar } from "./url.js";
import { Setting } from "./setting.js";

const outlayTBody = document
  .getElementById("itemTable")
  .getElementsByTagName("TBODY")[0];

/*window.addEventListener("unload", async function() {
  console.log("unload");
  await save();
});*/
let inputSum_onkeydown = function() {
  // https://stackoverflow.com/questions/2897155/get-cursor-position-in-characters-within-a-text-input-field
  event.returnValue =
    (96 <= event.keyCode && 105 >= event.keyCode) || // Num Lock Number
    (37 <= event.keyCode && 40 >= event.keyCode) || // Arrow
    8 == event.keyCode || // Backspace
    9 == event.keyCode || // Tab
    46 == event.keyCode || // Del
    ("." === event.key && !this.value.includes(".")) || // Точка (190 == event.keyCode || 191 == event.keyCode)
    (48 <= event.keyCode && // Number
      57 >= event.keyCode &&
      (this.value.search("\\.") < 0 || // Отсутствует точка
      this.value.search("\\.") + 3 > this.value.length || // После точки меньше 2-х цифр
      this.selectionStart < this.selectionEnd || // Выбрано не меее одной цифры
        this.value.search("\\.") + 1 > this.selectionStart)); // Курсор левеее точки
};

async function inputSum_oninput(elem) {
  try {
    const itemNum = Number(
      elem.parentElement.parentElement.cells.namedItem("colNum").innerText
    );
    let outlayEntry = await OutlayEntry.get(entryId);
    let sum = elem.value.trim();
    if (!sum) {
      sum = null;
    } else if (Number.isNaN(sum)) {
      return;
    } else {
      sum = parseFloat(elem.value);
    }
    outlayEntry.sums[itemNum - 1] = sum;
    await OutlayEntry.set(outlayEntry);
  } catch (error) {
    alert(error);
  }
}

async function itemAppend(categoryId, sum) {
  // Создаем строку таблицы и добавляем ее
  let row = document.createElement("TR");
  row.className = "odd";
  outlayTBody.appendChild(row);

  // Создаем ячейки в вышесозданной строке и добавляем их
  let tdNum = document.createElement("TD");
  let tdCategory = document.createElement("TD");
  let tdSum = document.createElement("TD");

  row.appendChild(tdNum);
  row.appendChild(tdCategory);
  row.appendChild(tdSum);

  // Наполняем ячейки
  tdNum.innerHTML = outlayTBody.getElementsByTagName("TR").length;

  let aCategory = document.createElement("A");
  aCategory.href =
    "outlayCategory.html" +
    "?entryId=" +
    entryId +
    "&itemNum=" +
    outlayTBody.getElementsByTagName("TR").length +
    "&categoryId=" +
    (categoryId ? categoryId : "");

  tdCategory.appendChild(aCategory);

  let inputSum = document.createElement("INPUT");
  inputSum.type = "text";
  inputSum.size = "40";
  inputSum.value = sum;
  inputSum.oninput = async function() {
    await inputSum_oninput(this);
  };
  inputSum.onkeydown = inputSum_onkeydown;
  tdSum.appendChild(inputSum);

  tdNum.id = "colNum";
  tdCategory.id = "colCategory";
  tdCategory.setAttribute("categoryId", categoryId);
  tdSum.id = "colSum";

  aCategory.innerHTML = categoryId
    ? (await Category.get(Number(categoryId))).name
    : "НЕ задана";
}

window.outlayEntryItemNew = outlayEntryItemNew;

async function outlayEntryItemNew() {
  let outlayEntry = await OutlayEntry.get(entryId);
  outlayEntry.categories.push(null);
  outlayEntry.sums.push(null);
  await OutlayEntry.set(outlayEntry);
  await itemAppend(null, null);
}

window.dateChanged = dateChanged;

async function dateChanged(date) {
  try {
    let outlayEntry = await OutlayEntry.get(entryId);
    outlayEntry.date = new Date(date);
    await OutlayEntry.set(outlayEntry);
    await Setting.set(outlayDateSelectedKeyName, outlayEntry.date);
  } catch (error) {
    alert(error);
  }
}

window.onload = openDb(window_onload);

let entryId = "";

async function window_onload() {
  entryId = Number(getQueryVar("id"));

  let outlayEntry = await OutlayEntry.get(entryId);
  document.getElementById("iptDate").value = outlayEntry.date
    ? outlayEntry.date._toForm()
    : outlayEntry.date;

  for (let i = 0; i < outlayEntry.categories.length; i++) {
    await itemAppend(outlayEntry.categories[i], outlayEntry.sums[i]);
  }
}

Date.prototype._toForm = function() {
  return (
    this.getFullYear() +
    "-" +
    (this.getMonth() + 1)._toForm() +
    "-" +
    this.getDate()._toForm()
  );
};

Number.prototype._toForm = function() {
  return 10 > this ? "0" + this : this.toString();
};

window.save = save;

async function save() {
  try {
    let date = new Date(document.getElementById("iptDate").value);
    let outlayEntry = {
      id: entryId,
      date: date,
      sumAll: 0,
      categoryId: null,
      categories: [],
      sums: []
    };
    for (let item of outlayTBody.getElementsByTagName("TR")) {
      let categoryId = Number(
        item.querySelector("#colCategory").getAttribute("categoryId")
      );
      let sum = Number(
        item.querySelector("#colSum").querySelector("INPUT").value
      );

      let ancestorsAll = null;
      if (sum) {
        outlayEntry.sumAll += sum;
        outlayEntry.categories.push(categoryId);
        outlayEntry.sums.push(sum);
      }
    }

    await OutlayEntry.set(outlayEntry);

    history.go(-1);
  } catch (error) {
    console.log(error);
    alert(error);
  }
}
