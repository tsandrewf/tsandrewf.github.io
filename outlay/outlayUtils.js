"use strict";

import { NavbarTop } from "./navbarTop.js";
import { NavbarBottom } from "./navbarBottom.js";
import { historyLengthIncreaseSet } from "./outlay.js";
import { localeString } from "./locale.js";

let divContent;

export class OutlayUtils {
  static displayData() {
    NavbarTop.show({
      menu: {
        buttonHTML: "&#9776;",
        content: [
          {
            innerHTML: localeString.settings._capitalize(),
            href: "#func=OutlaySettings",
          },
        ],
      },
      titleHTML: localeString.utility._capitalize(),
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

    document.title = localeString.utility._capitalize();

    {
      divContent = document.getElementsByClassName("content")[0];

      while (divContent.firstChild) {
        divContent.removeChild(divContent.firstChild);
      }
    }

    const divUtils = document.createElement("DIV");
    divContent.appendChild(divUtils);
    divUtils.className = "utils";

    {
      // Backup
      const divBackup = document.createElement("DIV");
      divUtils.appendChild(divBackup);
      divBackup.onclick = OutlayUtils.export;
      divBackup.className = "utilItem";

      const divIcon = document.createElement("DIV");
      divBackup.appendChild(divIcon);
      // Special characters
      // https://vsthemes.ru/posts/3239-simvoly-smajliki-emoji.html
      divIcon.innerHTML = "&#128190;";
      divIcon.className = "utilIcon";

      const divText = document.createElement("DIV");
      divBackup.appendChild(divText);
      divText.innerHTML = localeString.backup._capitalize();
    }

    {
      // Restore
      const divBackup = document.createElement("DIV");
      divUtils.appendChild(divBackup);
      divBackup.onclick = OutlayUtils.restore;
      divBackup.className = "utilItem";

      const divIcon = document.createElement("DIV");
      divBackup.appendChild(divIcon);
      // Special characters
      // https://vsthemes.ru/posts/3239-simvoly-smajliki-emoji.html
      divIcon.innerHTML = "&#128295;";
      divIcon.className = "utilIcon";

      const divText = document.createElement("DIV");
      divBackup.appendChild(divText);
      divText.innerHTML = localeString.restore._capitalize();
    }
  }

  static export() {
    if (!window.confirm(localeString.confirmBackup._capitalize())) return;

    historyLengthIncreaseSet();
    location.href = "#func=OutlayExport";
  }

  static restore() {
    historyLengthIncreaseSet();
    location.href = "#func=OutlayRestore";
  }
}
