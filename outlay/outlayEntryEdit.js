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
    //outlayEntry = await OutlayEntry.get(entryId);
    document.getElementById("sumAll").innerHTML = (
      await OutlayEntry.get(entryId)
    ).sumAll.toFixed(2);
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
  inputSum.size = "10";
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
  try {
    let rows = outlayTBody.rows;

    if (
      !rows.length ||
      rows[rows.length - 1].cells
        .namedItem("colSum")
        .getElementsByTagName("INPUT")[0].value
    ) {
      let outlayEntry = await OutlayEntry.get(entryId);
      outlayEntry.categories.push(null);
      outlayEntry.sums.push(null);
      await OutlayEntry.set(outlayEntry);
      await itemAppend(null, null);
    }

    rows[rows.length - 1].cells
      .namedItem("colSum")
      .getElementsByTagName("INPUT")[0]
      .focus();
  } catch (error) {
    alert(error);
  }
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
  NavbarTop.show({
    menu: {
      buttonHTML: "&#9776;",
      content: [
        { innerHTML: "Чеки", href: "outlay.html" },
        { innerHTML: "Категории расходов", href: "outlayCategory.html" },
        { innerHTML: "Итоги в разрезе категорий", href: "outlaySummary.html" }
      ]
    },
    titleHTML:
      'Чек за <input type="date" id="iptDate" oninput="dateChanged(this.value)" />',
    buttons: [
      {
        onclick: save,
        title: "Сохранить",
        innerHTML: "&#10004;"
      },
      {
        onclick: outlayEntryItemNew,
        title: "Новая позиция",
        innerHTML: "&#10010;"
      }
    ]
  });

  NavbarBottom.show([
    { text: "Чеки", href: "outlay.html" },
    { text: "Категории", href: "outlayCategory.html" },
    { text: "Итоги" }
  ]);

  NavbarBottom.show([
    { text: "Чеки", href: "outlay.html" },
    { text: "Категории", href: "outlayCategory.html" },
    { text: "Итоги", href: "outlaySummary.html" }
  ]);

  console.log(document.getElementsByClassName("navbar-top")[0]);
  let divNewString = document.createElement("DIV");
  document.getElementsByClassName("navbar-top")[0].appendChild(divNewString);
  divNewString.className = "new-string";
  divNewString.innerHTML = 'Итого: <span id="sumAll">sumAll</span>';
  entryId = Number(getQueryVar("id"));

  let outlayEntry = await OutlayEntry.get(entryId);
  document.getElementById("iptDate").value = outlayEntry.date
    ? outlayEntry.date._toForm()
    : outlayEntry.date;
  document.getElementById("sumAll").innerHTML = outlayEntry.sumAll.toFixed(2);

  for (let i = 0; i < outlayEntry.categories.length; i++) {
    await itemAppend(outlayEntry.categories[i], outlayEntry.sums[i]);
  }

  // Фокус на последнюю позицию, если эта позиция НЕ заполнена
  let rows = outlayTBody.rows;
  if (
    rows.length &&
    !rows[rows.length - 1].cells
      .namedItem("colSum")
      .getElementsByTagName("INPUT")[0].value
  ) {
    rows[rows.length - 1].cells
      .namedItem("colSum")
      .getElementsByTagName("INPUT")[0]
      .focus();
  }
}

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
