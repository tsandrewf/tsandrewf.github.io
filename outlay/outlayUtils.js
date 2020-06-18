"use strict";

import { NavbarTop } from "./navbarTop.js";
import { NavbarBottom } from "./navbarBottom.js";
import { historyLengthIncreaseSet } from "./outlay.js";
import { localeString, navbarButtons } from "./locale.js";
import { Setting } from "./setting.js";
import { setContentHeight } from "./pattern.js";

const divOutlayUtils = document.getElementById("outlayUtils");

export class OutlayUtils {
  static displayData() {
    Setting.setWindowOnload("OutlayUtils");

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

    NavbarBottom.setActiveButton(navbarButtons.navbarButtonUtils.href);

    setContentHeight();

    for (let div of document.querySelectorAll(".content > div")) {
      div.style.display = "none";
    }

    {
      while (divOutlayUtils.firstChild) {
        divOutlayUtils.removeChild(divOutlayUtils.firstChild);
      }
    }

    divOutlayUtils.className = "utils";

    {
      // Backup
      const divBackup = document.createElement("DIV");
      divOutlayUtils.appendChild(divBackup);
      divBackup.onclick = OutlayUtils.export;

      const divIcon = document.createElement("DIV");
      divBackup.appendChild(divIcon);
      // Special characters
      // https://vsthemes.ru/posts/3239-simvoly-smajliki-emoji.html
      divIcon.innerHTML = "&#128190;";

      const divText = document.createElement("DIV");
      divBackup.appendChild(divText);
      divText.innerHTML = localeString.backup._capitalize();
    }

    {
      // Restore
      const divBackup = document.createElement("DIV");
      divOutlayUtils.appendChild(divBackup);
      divBackup.onclick = OutlayUtils.restore;

      const divIcon = document.createElement("DIV");
      divBackup.appendChild(divIcon);
      // Special characters
      // https://vsthemes.ru/posts/3239-simvoly-smajliki-emoji.html
      divIcon.innerHTML = "&#128295;";

      const divText = document.createElement("DIV");
      divBackup.appendChild(divText);
      divText.innerHTML = localeString.restore._capitalize();
    }

    divOutlayUtils.style.display = "flex";
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
