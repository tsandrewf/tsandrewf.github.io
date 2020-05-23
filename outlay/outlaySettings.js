"use strict";

import { NavbarTop } from "./navbarTop.js";
import { NavbarBottom } from "./navbarBottom.js";
import { localeString, localeStringArray, Locale } from "./locale.js";

let divContent;

export class OutlaySettings {
  static displayData() {
    NavbarTop.show({
      menu: {
        buttonHTML: "&#9776;",
        content: [
          {
            innerHTML: localeString.utility._capitalize(),
            href: "#func=OutlayUtils",
          },
        ],
      },
      titleHTML: localeString.settings._capitalize(),
      buttons: [],
    });

    NavbarBottom.show2();

    document.title = localeString.settings._capitalize();

    {
      divContent = document.getElementsByClassName("content")[0];

      while (divContent.firstChild) {
        divContent.removeChild(divContent.firstChild);
      }
    }

    {
      const tableOutlaySettings = document.createElement("TABLE");
      divContent.appendChild(tableOutlaySettings);
      tableOutlaySettings.className = "tableOutlaySettings";
      const tbodyOutlaySettings = document.createElement("TBODY");
      tableOutlaySettings.appendChild(tbodyOutlaySettings);

      {
        // Locale
        const tr = document.createElement("TR");
        tbodyOutlaySettings.appendChild(tr);
        {
          const td = document.createElement("TD");
          tr.appendChild(td);
          td.innerHTML = localeStringArray[
            Locale.getNavigatorLanguage()
          ].language._capitalize();
        }
        {
          const td = document.createElement("TD");
          tr.appendChild(td);

          const selectLangs = document.createElement("SELECT");
          td.appendChild(selectLangs);
          selectLangs.onchange = async function (event) {
            await Locale.setUserLang(
              selectLangs.options[selectLangs.selectedIndex].value
            );
            OutlaySettings.displayData();
          };
          for (let locale of Object.entries(localeStringArray)) {
            const optionLang = document.createElement("OPTION");
            selectLangs.appendChild(optionLang);
            optionLang.value = locale[0];
            optionLang.innerText = locale[1]._langName;
            if (Locale.getUserLang() === locale[0]) {
              optionLang.selected = true;
            }
          }
        }
      }
    }
  }
}
