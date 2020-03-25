"use strict";

import { NavbarTop } from "./navbarTop.js";
import { NavbarBottom } from "./navbarBottom.js";
import { outlayDateSelectedKeyName } from "./db.js";
import { Category } from "./category.js";
import { OutlayEntry } from "./outlayEntry.js";
import { Setting } from "./setting.js";
import { OutlayCategory } from "./outlayCategory.js";
import { retValKeyName } from "./db.js";

let outlayTBody;
let entryId;

export class OutlayEntryEdit {
  static inputSum_onkeydown() {
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
        this.selectionStart < this.selectionEnd || // Выбрано не менее одной цифры
          this.value.search("\\.") + 1 > this.selectionStart)); // Курсор левее точки
  }

  static sumAllRefresh() {
    let sumAll = 0;
    for (let row of outlayTBody.rows) {
      let sum = row
        .querySelector("#colSum")
        .querySelector("INPUT")
        .value.trim();
      if (sum && !Number.isNaN(sum)) {
        sumAll += parseFloat(sum);
      }
    }
    document.getElementById("sumAll").innerHTML = sumAll.toFixed(2);
  }

  static async inputSum_oninput(elem) {
    OutlayEntryEdit.sumAllRefresh();
  }

  static async itemAppend(categoryId, sum) {
    // Создаем строку таблицы и добавляем ее
    let row = document.createElement("TR");
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
      "Javascript:OutlayEntryEdit_categoryEdit(" + tdNum.innerHTML + ")";

    tdCategory.appendChild(aCategory);

    let inputSum = document.createElement("INPUT");
    inputSum.type = "text";
    inputSum.size = "10";
    inputSum.value = sum;
    inputSum.oninput = async function() {
      await OutlayEntryEdit.inputSum_oninput(this);
    };
    inputSum.onkeydown = OutlayEntryEdit.inputSum_onkeydown;
    tdSum.appendChild(inputSum);

    tdNum.id = "colNum";
    tdCategory.id = "colCategory";
    tdCategory.setAttribute("categoryId", categoryId);
    tdSum.id = "colSum";

    aCategory.innerHTML = categoryId
      ? (await Category.get(Number(categoryId))).name
      : "НЕ задана";
  }

  static async outlayEntryItemNew() {
    try {
      let rows = outlayTBody.rows;

      if (
        !rows.length ||
        rows[rows.length - 1].cells
          .namedItem("colSum")
          .getElementsByTagName("INPUT")[0].value
      ) {
        await OutlayEntryEdit.itemAppend(null, null);
      }

      rows[rows.length - 1].cells
        .namedItem("colSum")
        .getElementsByTagName("INPUT")[0]
        .focus();
    } catch (error) {
      alert(error);
    }
  }

  static async dateChanged(date) {
    if (date) {
      date = new Date(date);
    }
    await Setting.set(outlayDateSelectedKeyName, date);
  }

  static categoryEdit(rowNum) {
    const content = document.body.getElementsByClassName("content")[0];
    window.history.replaceState(
      {
        url: "OutlayEntryEdit",
        window_scrollY: window.scrollY,
        content: content.innerHTML,
        date: document.getElementById("iptDate").value,
        rowNum: rowNum,
        sums: Array.prototype.slice
          .call(content.getElementsByTagName("INPUT"))
          .flatMap(x => [x.value])
      },
      window.title
    );
    window.history.pushState({ data: "data" }, "title");

    OutlayCategory.displayData(true);
  }

  static async displayData(id) {
    entryId = id;

    window.OutlayEntryEdit_dateChanged = OutlayEntryEdit.dateChanged;
    window.OutlayEntryEdit_categoryEdit = OutlayEntryEdit.categoryEdit;

    NavbarTop.show({
      menu: {
        buttonHTML: "&#9776;",
        content: [
          { innerHTML: "Чеки", href: "Javascript:OutlayEntries_displayData()" },
          {
            innerHTML: "Категории расходов",
            href: "Javascript:OutlayCategory_displayData()"
          },
          {
            innerHTML: "Итоги в разрезе категорий",
            href: "Javascript:OutlaySummary_displayData()"
          }
        ]
      },
      titleHTML:
        'Чек за <input type="date" id="iptDate" oninput="OutlayEntryEdit_dateChanged(this.value)" />',
      buttons: [
        {
          onclick: OutlayEntryEdit.save,
          title: "Сохранить",
          innerHTML: "&#10004;"
        },
        {
          onclick: OutlayEntryEdit.outlayEntryItemNew,
          title: "Новая позиция",
          innerHTML: "&#10010;"
        }
      ]
    });

    NavbarBottom.show([
      { text: "Чеки", href: "Javascript:OutlayEntries_displayData()" },
      { text: "Категории", href: "Javascript:OutlayCategory_displayData()" },
      { text: "Итоги", href: "Javascript:OutlaySummary_displayData()" }
    ]);

    let divNewString = document.createElement("DIV");
    document.getElementsByClassName("navbar-top")[0].appendChild(divNewString);
    divNewString.className = "new-string";
    divNewString.innerHTML = 'Итого: <span id="sumAll">sumAll</span>';

    const content = document.getElementsByClassName("content")[0];

    if (window.history.state) {
      content.innerHTML = window.history.state.content;
      document.getElementById("iptDate").value = window.history.state.date;
      const inputArray = content.getElementsByTagName("INPUT");
      for (let i = 0; i < inputArray.length; i++) {
        inputArray[i].value = window.history.state.sums[i];
      }

      outlayTBody = document.getElementsByTagName("TBODY")[0];
      OutlayEntryEdit.sumAllRefresh();
      entryId = Number(
        content.getElementsByTagName("TABLE")[0].getAttribute("entryId")
      );
      if (window.history.state.rowNum) {
        const categoryId = await Setting.get(retValKeyName);
        if (categoryId) {
          const tdCategory = content.getElementsByTagName("TBODY")[0].rows[
            window.history.state.rowNum - 1
          ].cells["colCategory"];
          tdCategory.setAttribute("categoryid", categoryId);
          const aCategory = tdCategory.getElementsByTagName("A")[0];
          aCategory.innerHTML = (await Category.get(categoryId)).name;
        }
      }

      return;
    }

    {
      const divContent = document.getElementsByClassName("content")[0];

      while (divContent.firstChild) {
        divContent.removeChild(divContent.firstChild);
      }
    }

    const table = document.createElement("TABLE");
    content.appendChild(table);
    table.className = "tableBase tableOutlayEntryEdit";
    table.setAttribute("entryId", entryId);
    outlayTBody = document.createElement("TBODY");
    table.appendChild(outlayTBody);

    let outlayEntry = entryId
      ? await OutlayEntry.get(entryId)
      : {
          date: new Date(await Setting.get(outlayDateSelectedKeyName)),
          sumAll: 0,
          categories: [null],
          sums: [null]
        };

    if (outlayEntry.date) {
      document.getElementById("iptDate").value = outlayEntry.date._toForm();
    }
    document.getElementById("sumAll").innerHTML = outlayEntry.sumAll.toFixed(2);

    for (let i = 0; i < outlayEntry.categories.length; i++) {
      await OutlayEntryEdit.itemAppend(
        outlayEntry.categories[i],
        outlayEntry.sums[i]
      );
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

  /*Number.prototype._toForm = function() {
  return 10 > this ? "0" + this : this.toString();
};*/

  //window.save = save;

  static async save() {
    try {
      const date = new Date(document.getElementById("iptDate").value);
      if (!date) {
        throw Error("НЕ задана дата чека");
      }

      let outlayEntry = {
        date: date,
        sumAll: 0,
        categoryId: null,
        categories: [],
        sums: []
      };
      if (entryId) {
        outlayEntry.id = entryId;
      }

      for (let item of outlayTBody.getElementsByTagName("TR")) {
        let categoryId = Number(
          item.querySelector("#colCategory").getAttribute("categoryId")
        );
        let sum = Number(
          item.querySelector("#colSum").querySelector("INPUT").value
        );

        if (sum) {
          outlayEntry.sumAll += sum;
          outlayEntry.categories.push(categoryId);
          outlayEntry.sums.push(sum);
        }
      }

      await OutlayEntry.set(outlayEntry);

      history.back();
    } catch (error) {
      alert(error);
    }
  }
}
