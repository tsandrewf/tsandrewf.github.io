"use strict";

import { NavbarTop } from "./navbarTop.js";
import { NavbarBottom } from "./navbarBottom.js";
import { outlayDateSelectedKeyName, outlaySummaryPeriodKeyName } from "./db.js";
import { Category } from "./category.js";
import { OutlayEntry } from "./outlayEntry.js";
import { Setting } from "./setting.js";
import { retValKeyName } from "./db.js";
import { historyLengthIncreaseSet } from "./outlay.js";
import { localeString } from "./locale.js";
import { setContentHeight } from "./pattern.js";
import { paramRefresh } from "./needRefresh.js";
import { OutlayEntries, tbodyOutlayEntries } from "./outlayEntries.js";

let outlayTBody;
let entryId;
let outlayEntryRem;

const divOutlayEntryEdit = document.getElementById("outlayEntryEdit");

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
      const sum = row.querySelector("#colSum > INPUT").value.trim();
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
    inputSum.oninput = OutlayEntryEdit.inputSum_oninput;
    inputSum.onkeydown = OutlayEntryEdit.inputSum_onkeydown;
    tdSum.appendChild(inputSum);

    tdNum.id = "colNum";
    tdCategory.id = "colCategory";
    tdCategory.setAttribute("categoryId", categoryId);
    tdSum.id = "colSum";

    aCategory.innerHTML = categoryId
      ? (await Category.get(Number(categoryId))).name
      : localeString.notSet._capitalizeWords();
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
        content: divOutlayEntryEdit.innerHTML,
        date: document.getElementById("iptDate").value,
        rowNum: rowNum,
        sums: Array.prototype.slice
          .call(divOutlayEntryEdit.getElementsByTagName("INPUT"))
          .flatMap((x) => [x.value]),
      },
      window.title
    );
    /*window.history.pushState({ data: "data" }, "title");

    OutlayCategory.displayData(true);*/
    historyLengthIncreaseSet();
    location.href = "#func=OutlayCategory&needCategorySave=true";
  }

  static async displayData(id) {
    entryId = id;

    window.OutlayEntryEdit_dateChanged = OutlayEntryEdit.dateChanged;
    window.OutlayEntryEdit_categoryEdit = OutlayEntryEdit.categoryEdit;

    NavbarTop.show({
      back: localeString.checks._capitalize(),
      titleHTML:
        localeString.check._capitalize() +
        ' <input type="date" id="iptDate" oninput="OutlayEntryEdit_dateChanged(this.value)" />',
      buttons: [
        {
          onclick: OutlayEntryEdit.save,
          title: localeString.save._capitalize(),
          innerHTML: "&#10004;",
        },
        {
          onclick: OutlayEntryEdit.outlayEntryItemNew,
          title: localeString.newRecord._capitalize(),
          innerHTML: "&#10010;",
        },
      ],
    });
    {
      document
        .getElementsByClassName("action-bar")
        .item(0)
        .classList.add("action-bar-wrap");
    }

    NavbarBottom.setActiveButton();

    let divNewString = document.createElement("DIV");
    document.getElementsByClassName("action-bar")[0].appendChild(divNewString);
    divNewString.className = "new-string";
    divNewString.innerHTML =
      localeString.total._capitalize() + ': <span id="sumAll">sumAll</span>';

    setContentHeight();

    for (let div of document.querySelectorAll(".content > div")) {
      div.style.display = "none";
    }

    if (window.history.state) {
      divOutlayEntryEdit.innerHTML = window.history.state.content;
      document.getElementById("iptDate").value = window.history.state.date;
      const inputArray = divOutlayEntryEdit.getElementsByTagName("INPUT");
      for (let i = 0; i < inputArray.length; i++) {
        inputArray[i].value = window.history.state.sums[i];
      }

      outlayTBody = divOutlayEntryEdit.querySelector("TBODY");
      OutlayEntryEdit.sumAllRefresh();
      entryId = Number(
        divOutlayEntryEdit
          .getElementsByTagName("TABLE")[0]
          .getAttribute("entryId")
      );
      if (window.history.state.rowNum) {
        const categoryId = await Setting.get(retValKeyName);
        if (categoryId) {
          const tdCategory = divOutlayEntryEdit.getElementsByTagName("TBODY")[0]
            .rows[window.history.state.rowNum - 1].cells["colCategory"];
          tdCategory.setAttribute("categoryid", categoryId);
          const aCategory = tdCategory.getElementsByTagName("A")[0];
          aCategory.innerHTML = (await Category.get(categoryId)).name;
        }
      }

      divOutlayEntryEdit.style.display = "block";

      return;
    }

    {
      while (divOutlayEntryEdit.firstChild) {
        divOutlayEntryEdit.removeChild(divOutlayEntryEdit.firstChild);
      }
    }

    const table = document.createElement("TABLE");
    divOutlayEntryEdit.appendChild(table);
    table.className = "tableBase tableOutlayEntryEdit";
    table.setAttribute("entryId", entryId);
    outlayTBody = document.createElement("TBODY");
    table.appendChild(outlayTBody);

    /*let outlayEntry = entryId
      ? await OutlayEntry.get(entryId)
      : {
          date: new Date(await Setting.get(outlayDateSelectedKeyName)),
          sumAll: 0,
          categories: [null],
          sums: [null],
        };*/
    let outlayEntry;
    if (entryId) {
      outlayEntryRem = await OutlayEntry.get(entryId);
      outlayEntry = outlayEntryRem;
    } else {
      outlayEntryRem = null;
      outlayEntry = {
        date: new Date(await Setting.get(outlayDateSelectedKeyName)),
        sumAll: 0,
        categories: [null],
        sums: [null],
      };
    }

    if (!isNaN(outlayEntry.date)) {
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

    divOutlayEntryEdit.style.display = "block";
  }

  static ifSingleEntryInMonth(trEntry) {
    {
      const trPrev = trEntry.previousSibling;
      if (
        !trPrev.getAttribute("outlayentryid") &&
        trEntry.nextSibling &&
        !trEntry.nextSibling.getAttribute("outlayentryid")
      ) {
        tbodyOutlayEntries.removeChild(trPrev);
      }
    }
  }

  static async save() {
    try {
      const dateString = document.getElementById("iptDate").value;
      if (!dateString) {
        throw Error(localeString.checkDateNotSet._capitalize());
      }
      const date = new Date(dateString);
      if (isNaN(date)) {
        throw Error(
          localeString.invalidDate._capitalize() + ' "' + dateString + '"'
        );
      }

      let outlayEntry = {
        date: date,
        sumAll: 0,
        categoryId: null,
        categories: [],
        sums: [],
      };
      if (entryId) {
        outlayEntry.id = entryId;
      }

      for (let item of outlayTBody.getElementsByTagName("TR")) {
        let categoryId = Number(
          item.querySelector("#colCategory").getAttribute("categoryId")
        );
        let sum = Number(item.querySelector("#colSum > INPUT").value);

        if (sum) {
          outlayEntry.sumAll += sum;
          outlayEntry.categories.push(categoryId);
          outlayEntry.sums.push(sum);
        }
      }

      await OutlayEntry.set(outlayEntry);

      if (!paramRefresh.outlaySummary.needRefresh) {
        let datePeriod = await Setting.get(outlaySummaryPeriodKeyName);

        paramRefresh.outlaySummary.needRefresh =
          ((!datePeriod.dateBeg || datePeriod.dateBeg <= outlayEntry.date) &&
            (!datePeriod.dateEnd || datePeriod.dateEnd >= outlayEntry.date)) ||
          (outlayEntryRem &&
            (!datePeriod.dateBeg ||
              datePeriod.dateBeg <= outlayEntryRem.date) &&
            (!datePeriod.dateEnd || datePeriod.dateEnd >= outlayEntryRem.date));
      }

      {
        // Refresh outlayEntries
        let trEntry;
        if (outlayEntryRem) {
          // Edited Entry -> find entry row
          trEntry = tbodyOutlayEntries.querySelector(
            'tr[outlayentryid="' + outlayEntryRem.id + '"]'
          );
          // Fix entry row
          // Date
          trEntry.querySelector("td:nth-child(1)").innerHTML =
            outlayEntry.date && outlayEntry.date instanceof Date
              ? outlayEntry.date._toStringBrief()
              : localeString.notSet._capitalize();
          // Category. ToDo!
          // Sum
          trEntry.querySelector(
            "td:nth-child(3) > a"
          ).innerHTML = outlayEntry.sumAll.toFixed(2);
        } else {
          // New Entry. Create new entry row
          trEntry = await OutlayEntries.trEntryAppend(outlayEntry);
        }

        if (
          // If New Entry or Entry date was changed
          !outlayEntryRem ||
          outlayEntryRem.date.valueOf() !== outlayEntry.date.valueOf()
        ) {
          if (
            // If Entry was edited and Entry month was changed
            outlayEntryRem &&
            outlayEntryRem.date.getMonth() !== outlayEntry.date.getMonth()
          )
            // Delete month title, if this entry is single in month
            OutlayEntryEdit.ifSingleEntryInMonth(trEntry);

          let trInserted = false;
          for (let tr of tbodyOutlayEntries.querySelectorAll(
            "tr[outlayentryid]"
          )) {
            const entryDate = (
              await OutlayEntry.get(Number(tr.getAttribute("outlayentryid")))
            ).date;

            const entry = await OutlayEntry.get(
              Number(tr.getAttribute("outlayentryid"))
            );

            if (
              outlayEntry.date.valueOf() > entry.date.valueOf() ||
              (outlayEntry.date.valueOf() === entry.date.valueOf() &&
                outlayEntry.id > entry.id)
            ) {
              if (outlayEntry.date.getMonth() === entry.date.getMonth()) {
                tbodyOutlayEntries.insertBefore(trEntry, tr);
              } else {
                tbodyOutlayEntries.insertBefore(trEntry, tr.previousSibling);

                {
                  const trPrev = trEntry.previousSibling;
                  if (
                    !trPrev ||
                    !trPrev.getAttribute("outlayentryid") ||
                    (
                      await OutlayEntry.get(
                        Number(trPrev.getAttribute("outlayentryid"))
                      )
                    ).date.getMonth() !== outlayEntry.date.getMonth()
                  ) {
                    tbodyOutlayEntries.insertBefore(
                      OutlayEntries.getTrMonth(outlayEntry.date),
                      trEntry
                    );
                  }
                }
              }

              trInserted = true;
              break;
            }
          }

          if (!trInserted) {
            //OutlayEntryEdit.ifSingleEntryInMonth(trEntry);
          }
          //paramRefresh.outlayEntries.needRefresh = true;
        }
      }

      history.back();
    } catch (error) {
      alert(error);
    }
  }
}
