"use strict";

import { historyLengthInit, historyLengthCurrent } from "./outlay.js";
import {
  navbarButtonEntries,
  navbarButtonCategory,
  navbarButtonSummary,
} from "./locale.js";

export class NavbarBottom {
  static show(options, optionSelectedNum) {
    let navbarBottom = document.getElementsByClassName("navbar-bottom").item(0);

    while (navbarBottom.firstChild) {
      navbarBottom.removeChild(navbarBottom.firstChild);
    }

    if (navigator.standalone) {
      let div = document.createElement("DIV");
      navbarBottom.appendChild(div);
      if (0 < historyLengthCurrent - historyLengthInit) {
        let a = document.createElement("A");
        div.appendChild(a);
        a.innerHTML = "<";
        a.href = "Javascript:window.history.back();";
      } else {
        div.innerHTML = "<";
      }
    }

    for (let option of [
      navbarButtonEntries,
      navbarButtonCategory,
      navbarButtonSummary,
    ]) {
      const divButton = document.createElement("DIV");
      navbarBottom.appendChild(divButton);
      divButton.setAttribute("funcName", option.href);
      divButton.onclick = function () {
        if ("navbar-bottom-div-active" === this.className) return;
        displayData(this.getAttribute("funcName"));
      };

      const divIcon = document.createElement("DIV");
      divButton.appendChild(divIcon);
      const elemI = document.createElement("I");
      divIcon.appendChild(elemI);
      elemI.className = "material-icons";
      elemI.innerHTML = option.icon;

      const divText = document.createElement("DIV");
      divButton.appendChild(divText);
      divText.innerHTML = option.text;
    }
  }

  static setActiveButton(funcName) {
    const navbarBottom = document
      .getElementsByClassName("navbar-bottom")
      .item(0);
    for (let div of navbarBottom.children) {
      div.className =
        div.getAttribute("funcName") === funcName
          ? "navbar-bottom-div-active"
          : "navbar-bottom-div-passive";
    }
  }
}
