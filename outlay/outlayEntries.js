"use strict";

import { NavbarTop } from "./navbarTop.js";
import { NavbarBottom } from "./navbarBottom.js";
import { OutlayEntry } from "./outlayEntry.js";
import { Category } from "./category.js";
import { Setting } from "./setting.js";
import { OutlayUtils } from "./outlayUtils.js";
import { historyLengthIncreaseSet } from "./outlay.js";
import { localeString, navbarButtons } from "./locale.js";
import { setContentHeight } from "./pattern.js";
import {
  outlayEntriesDateMinCalcKeyName,
  outlaySummaryPeriodKeyName,
  outlayObjectStoreName,
  db,
} from "./db.js";
import { paramRefresh } from "./needRefresh.js";

export let tbodyOutlayEntries;
const divOutlayEntries = document.getElementById("outlayEntries");

window.OutlayUtils_displayData = function () {
  window.history.pushState(null, "title");

  OutlayUtils.displayData();
};

export class OutlayEntries {
  static outlayEntryEdit(entryId) {
    historyLengthIncreaseSet();
    paramRefresh.outlayEntries.scrollTop =
      divOutlayEntries.parentElement.scrollTop;
    location.href =
      "#func=OutlayEntryEdit&entryId=" +
      ("number" === (typeof entryId).toLowerCase() ? entryId : "");
  }

  static async displayData(dateBeg, dateEnd) {
    Setting.setWindowOnload("OutlayEntries");

    window.OutlayEntries_outlayEntryDelete = OutlayEntries.outlayEntryDelete;
    window.OutlayEntries_outlayEntryEdit = OutlayEntries.outlayEntryEdit;

    NavbarTop.show({
      menu: {
        buttonHTML: "&#9776;",
        content: [
          {
            innerHTML: localeString.settings._capitalize(),
            href: "#func=OutlaySettings",
          },
          {
            innerHTML: localeString.utility._capitalize(),
            href: "#func=OutlayUtils",
          },
        ],
      },
      titleHTML: localeString.checks._capitalize(),
      buttons: [
        {
          onclick: OutlayEntries.outlayEntryEdit,
          title: localeString.add._capitalizeWords() + " " + localeString.check,
          innerHTML: "&#10010;",
        },
      ],
    });

    NavbarBottom.setActiveButton(navbarButtons.navbarButtonEntries.href);

    setContentHeight();

    for (let div of document.querySelectorAll(".content > div")) {
      div.style.display = "none";
    }

    if (paramRefresh.outlayEntries.needRefresh) {
      {
        while (divOutlayEntries.firstChild) {
          divOutlayEntries.removeChild(divOutlayEntries.firstChild);
        }
      }

      tbodyOutlayEntries = document.createElement("TBODY");
      {
        const tableOutlayEntries = document.createElement("TABLE");
        divOutlayEntries.appendChild(tableOutlayEntries);
        tableOutlayEntries.className = "tableBase tableOutlayEntries";
        tableOutlayEntries.appendChild(tbodyOutlayEntries);
      }
      OutlayEntries.addEntries(null, 3);

      paramRefresh.outlayEntries.needRefresh = false;
    }

    divOutlayEntries.style.display = "block";
    divOutlayEntries.parentElement.scrollTop =
      paramRefresh[divOutlayEntries.id].scrollTop;
  }

  static getTrMonth(date) {
    const tr = document.createElement("TR");
    tr.style.backgroundColor = "grey";
    tr.style.color = "white";
    const td = document.createElement("TD");
    tr.appendChild(td);
    td.innerHTML = date._getMonthString() + " " + date.getFullYear();
    td.innerHTML = td.innerHTML.charAt(0).toUpperCase() + td.innerHTML.slice(1);
    td.colSpan = 4;

    return tr;
  }

  static async addEntries(dateBeg, monthCountMax) {
    const outlayEntriesDateMinCalc = await Setting.get(
      outlayEntriesDateMinCalcKeyName
    );

    await new Promise(function (resolve, reject) {
      let request = db
        .transaction(outlayObjectStoreName)
        .objectStore(outlayObjectStoreName)
        .index("date_idx")
        .openCursor(
          !dateBeg ? null : IDBKeyRange.upperBound(dateBeg, true),
          "prev"
        );
      let lastEntryMonth = -1;
      let monthCount = 0;

      request.onsuccess = function (event) {
        const cursor = event.target.result;

        if (cursor) {
          const entryMonth = cursor.value.date.getMonth();
          if (entryMonth !== lastEntryMonth) {
            monthCount++;
            if (monthCountMax < monthCount) {
              tbodyOutlayEntries.appendChild(
                OutlayEntries.getMonthTitleTr(cursor.value.date, true)
              );
              resolve();
              return;
            }
            tbodyOutlayEntries.appendChild(
              OutlayEntries.getMonthTitleTr(cursor.value.date)
            );
            lastEntryMonth = entryMonth;
          }
          OutlayEntries.trEntryAppend(cursor.value);
          cursor.continue();
        } else {
          resolve();
        }
      };

      request.onerror = function () {
        reject(request.error);
      };
    });

    if (outlayEntriesDateMinCalc >= dateBeg) {
      await Setting.set(outlayEntriesDateMinCalcKeyName, dateBeg._prevDay());
    }
  }

  static getMonthTitleTr(date, appendNewMonth) {
    console.log("date", date);
    const row = document.createElement("TR");
    row.style.backgroundColor = "grey";
    row.style.color = "white";

    if (appendNewMonth) {
      row.onclick = function () {
        row.setAttribute("date", date._getMonthEnd().valueOf());
        tbodyOutlayEntries.removeChild(this);
        OutlayEntries.addEntries(new Date(Number(row.getAttribute("date"))), 1);
      };
      row.style.cursor = "pointer";
    }

    let tdAppend = document.createElement("TD");
    row.appendChild(tdAppend);
    tdAppend.innerHTML = (
      (appendNewMonth ? localeString.add + " " : "") +
      date._getMonthString() +
      " " +
      date.getFullYear()
    )._capitalize();
    tdAppend.colSpan = 4;

    console.log("row", row);
    console.log("date", row.getAttribute("date"));
    console.log("date", new Date(Number(row.getAttribute("date"))));

    return row;
  }

  static async trEntryAppend(outlayEntry) {
    // Создаем строку таблицы и добавляем ее
    const row = document.createElement("TR");
    tbodyOutlayEntries.appendChild(row);
    row.setAttribute("outlayentryid", outlayEntry.id);

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
        : localeString.notSet._capitalize();

    const category = await Category.get(outlayEntry.categoryId);

    tdCategory.innerHTML = category ? category.name : "";
    tdSum.innerHTML =
      '<a href="Javascript:OutlayEntries_outlayEntryEdit(' +
      outlayEntry.id +
      ')">' +
      (outlayEntry.sumAll ? outlayEntry.sumAll.toFixed(2) : "НЕ задана") +
      "</a>";
    tdDel.innerHTML =
      '<a href="Javascript:OutlayEntries_outlayEntryDelete(' +
      outlayEntry.id +
      ')">&#10006</a>';

    return row;
  }

  static async outlayEntryDelete(key) {
    if (!window.confirm(localeString.confirmCheckDelete)) {
      return;
    }

    try {
      const datePeriod = await Setting.get(outlaySummaryPeriodKeyName);
      const outlayEntry = await OutlayEntry.get(key);

      await OutlayEntry.delete(key);

      paramRefresh.outlaySummary.needRefresh =
        (!datePeriod.dateBeg || datePeriod.dateBeg <= outlayEntry.date) &&
        (!datePeriod.dateEnd || datePeriod.dateEnd >= outlayEntry.date);

      {
        // Delete row (trToDelete) from DOM
        const trToDelete = tbodyOutlayEntries.querySelector(
          'tr[outlayentryid="' + key + '"]'
        );
        if (
          // Is row to delete a single row for the month?
          trToDelete.previousSibling &&
          !trToDelete.previousSibling.getAttribute("outlayentryid") &&
          (!trToDelete.nextSibling ||
            !trToDelete.nextSibling.getAttribute("outlayentryid"))
        ) {
          // Delete Month's title
          tbodyOutlayEntries.removeChild(trToDelete.previousSibling);
        }
        // Delete row
        tbodyOutlayEntries.removeChild(trToDelete);
      }
    } catch (error) {
      alert(error);
    }
  }
}
