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

    NavbarBottom.show([
      {
        text: localeString.checks._capitalize(),
        href: 'Javascript:displayData("OutlayEntries")',
      },
      {
        text: localeString.categories._capitalize(),
        href: 'Javascript:displayData("OutlayCategory")',
      },
      {
        text: localeString.results._capitalize(),
        href: 'Javascript:displayData("OutlaySummary")',
      },
    ]);

    document.title = localeString.settings._capitalize();

    {
      divContent = document.getElementsByClassName("content")[0];

      while (divContent.firstChild) {
        divContent.removeChild(divContent.firstChild);
      }
    }

    {
      // Locale
      const selectLangs = document.createElement("SELECT");
      divContent.appendChild(selectLangs);
      selectLangs.oninput = function (event) {
        Locale.setUserLang(
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
