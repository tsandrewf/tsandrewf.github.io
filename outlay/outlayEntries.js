"use strict";

import { NavbarTop } from "./navbarTop.js";
import { NavbarBottom } from "./navbarBottom.js";
import { OutlayEntry } from "./outlayEntry.js";
import { Category } from "./category.js";
import { Setting } from "./setting.js";
import { OutlayUtils } from "./outlayUtils.js";
import { outlayEntriesDateMinCalcKeyName } from "./db.js";
import { historyLengthIncreaseSet } from "./outlay.js";
import { localeString, navbarButtons } from "./locale.js";
import { setContentHeight } from "./pattern.js";
import { outlaySummaryPeriodKeyName } from "./db.js";
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
      OutlayEntries.addEntries(dateBeg, dateEnd);

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

  static async addEntries(dateBeg, dateEnd) {
    function appendRowNewMonth(date) {
      let row = document.createElement("TR");
      tbodyOutlayEntries.appendChild(row);
      row.style.backgroundColor = "grey";
      row.style.color = "white";
      let td = document.createElement("TD");
      row.appendChild(td);
      td.innerHTML = date._getMonthString() + " " + date.getFullYear();
      td.innerHTML =
        td.innerHTML.charAt(0).toUpperCase() + td.innerHTML.slice(1);
      td.colSpan = 4;
    }

    let monthNumRem = null;

    {
      let entryYoungest = await OutlayEntry.getEntryYoungest();

      if (!dateBeg) {
        dateBeg = (entryYoungest ? entryYoungest.date : new Date())
          ._getMonthBeg()
          ._prevDay()
          ._getMonthBeg()
          ._prevDay()
          ._getMonthBeg();
      }

      if (tbodyOutlayEntries.rows.length) {
        let row = tbodyOutlayEntries.rows[tbodyOutlayEntries.rows.length - 1];
        row.onclick = null;
        row.style.cursor = null;
        let td = row.getElementsByTagName("TD")[0];

        td.innerHTML = td.innerHTML
          .replace(new RegExp(localeString.add, "gi"), "")
          .trim();

        td.innerHTML =
          td.innerHTML.charAt(0).toUpperCase() + td.innerHTML.slice(1);
      } else if (entryYoungest) {
        appendRowNewMonth(entryYoungest.date);

        monthNumRem = entryYoungest.date.getMonth();
      }
    }

    //try {
    let outlayEntries = await OutlayEntry.getEntries({
      dateBeg: dateBeg,
      dateEnd: dateEnd,
    });

    const outlayEntriesDateMinCalc = await Setting.get(
      outlayEntriesDateMinCalcKeyName
    );

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

      tbodyOutlayEntries.appendChild(
        await OutlayEntries.trEntryAppend(outlayEntry)
      );

      if (outlayEntriesDateMinCalc >= outlayEntry.date) {
        const categoryIdNew = await OutlayEntry.getCategoryIdTop(outlayEntry);

        if (categoryIdNew !== outlayEntry.categoryId) {
          outlayEntry.categoryId = categoryIdNew;
          OutlayEntry.set(outlayEntry);
        }
      }
    }

    if (outlayEntriesDateMinCalc >= dateBeg) {
      await Setting.set(outlayEntriesDateMinCalcKeyName, dateBeg._prevDay());
    }

    let entryOlder = await OutlayEntry.getEntryOlder(dateBeg);
    if (entryOlder) {
      let dateEndNew = entryOlder.date._getMonthEnd();
      let dateBegNew = dateEndNew._getMonthBeg();

      // Создаем строку таблицы и добавляем ее
      let row = document.createElement("TR");
      tbodyOutlayEntries.appendChild(row);
      row.style.backgroundColor = "grey";
      row.style.color = "white";
      row.onclick = function () {
        OutlayEntries.addEntries(dateBegNew, dateEndNew);
      };
      row.style.cursor = "pointer";

      let tdAppend = document.createElement("TD");
      row.appendChild(tdAppend);
      tdAppend.innerHTML = (
        localeString.add +
        " " +
        dateBegNew._getMonthString() +
        " " +
        dateBegNew.getFullYear()
      )._capitalize();
      tdAppend.colSpan = 4;
    }
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
