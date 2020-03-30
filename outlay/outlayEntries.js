"use strict";

import { NavbarTop } from "./navbarTop.js";
import { NavbarBottom } from "./navbarBottom.js";
import { OutlayEntry } from "./outlayEntry.js";
import { Category } from "./category.js";
import { Setting } from "./setting.js";
import { OutlayUtils } from "./outlayUtils.js";
import { windowOnloadKeyName, outlayEntriesDateMinCalcKeyName } from "./db.js";

let tbodyOutlayEntries;

window.OutlayUtils_displayData = function() {
  window.history.pushState(null, "title");

  OutlayUtils.displayData();
};

export class OutlayEntries {
  static outlayEntryEdit(entryId) {
    location.href =
      "#func=OutlayEntryEdit&entryId=" +
      ("number" === (typeof entryId).toLowerCase() ? entryId : "");
  }

  static async displayData(dateBeg, dateEnd) {
    {
      const funcName = "Outlay";
      if (funcName !== (await Setting.get(windowOnloadKeyName))) {
        await Setting.set(windowOnloadKeyName, funcName);
      }
    }

    document.title = "Чеки";

    window.OutlayEntries_outlayEntryDelete = OutlayEntries.outlayEntryDelete;
    window.OutlayEntries_outlayEntryEdit = OutlayEntries.outlayEntryEdit;

    NavbarTop.show({
      menu: {
        buttonHTML: "&#9776;",
        content: [
          {
            innerHTML: "Категории расходов",
            href: "Javascript:OutlayCategory_displayData()"
          },
          {
            innerHTML: "Итоги в разрезе категорий",
            href: "Javascript:OutlaySummary_displayData()"
          },
          {
            innerHTML: "Утилиты",
            href: "#func=OutlayUtils"
          }
        ]
      },
      titleHTML: "Чеки",
      buttons: [
        {
          onclick: OutlayEntries.outlayEntryEdit,
          title: "Добавить чек",
          innerHTML: "&#10010;"
        }
      ]
    });

    NavbarBottom.show([
      { text: "Чеки" },
      { text: "Категории", href: "Javascript:OutlayCategory_displayData()" },
      { text: "Итоги", href: "Javascript:OutlaySummary_displayData()" }
    ]);

    {
      const divContent = document.getElementsByClassName("content")[0];

      while (divContent.firstChild) {
        divContent.removeChild(divContent.firstChild);
      }
    }

    tbodyOutlayEntries = document.createElement("TBODY");
    {
      const divContent = document.getElementsByClassName("content")[0];
      const tableOutlayEntries = document.createElement("TABLE");
      divContent.appendChild(tableOutlayEntries);
      tableOutlayEntries.className = "tableBase tableOutlayEntries";
      tableOutlayEntries.appendChild(tbodyOutlayEntries);
    }
    OutlayEntries.addEntries(dateBeg, dateEnd);
  }

  static async addEntries(dateBeg, dateEnd) {
    function appendRowNewMonth(date) {
      let row = document.createElement("TR");
      tbodyOutlayEntries.appendChild(row);
      row.style.backgroundColor = "grey";
      row.style.color = "white";
      let td = document.createElement("TD");
      row.appendChild(td);
      td.innerHTML = date._getMonthString() + " " + date.getFullYear() + "г.";
      td.innerHTML =
        td.innerHTML.charAt(0).toUpperCase() + td.innerHTML.slice(1);
      td.colSpan = 4;
    }

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

      if (tbodyOutlayEntries.rows.length) {
        let row = tbodyOutlayEntries.rows[tbodyOutlayEntries.rows.length - 1];
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

    //try {
    let outlayEntries = await OutlayEntry.getEntries({
      dateBeg: dateBeg,
      dateEnd: dateEnd
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

      // Создаем строку таблицы и добавляем ее
      let row = document.createElement("TR");
      tbodyOutlayEntries.appendChild(row);

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

      let category;
      if (outlayEntriesDateMinCalc >= outlayEntry.date) {
        const categoryIdNew = await OutlayEntry.getCategoryIdTop(outlayEntry);

        if (categoryIdNew !== outlayEntry.categoryId) {
          outlayEntry.categoryId = categoryIdNew;
          OutlayEntry.set(outlayEntry);
        }
      }
      category = await Category.get(outlayEntry.categoryId);

      tdCategory.innerHTML = category ? category.name : "";
      tdSum.innerHTML =
        /*'<a href="#func=OutlayEntryEdit&entryId=' +
        outlayEntry.id +
        '">' +*/
        '<a href="Javascript:OutlayEntries_outlayEntryEdit(' +
        outlayEntry.id +
        ')">' +
        (outlayEntry.sumAll ? outlayEntry.sumAll.toFixed(2) : "НЕ задана") +
        "</a>";
      tdDel.innerHTML =
        '<a href="Javascript:OutlayEntries_outlayEntryDelete(' +
        outlayEntry.id +
        ')">&#10006</a>';
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
      row.onclick = function() {
        OutlayEntries.addEntries(dateBegNew, dateEndNew);
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

  static async outlayEntryDelete(key) {
    if (!window.confirm("Вы действительно хотите удалить чек?")) {
      return;
    }

    try {
      await OutlayEntry.delete(key);
      OutlayEntries.displayData();
    } catch (error) {
      alert(error);
    }
  }
}
