"use strict";

import { historyLengthInit, historyLengthCurrent } from "./outlay.js";
import {
  navbarButtonEntries,
  navbarButtonCategory,
  navbarButtonSummary,
} from "./locale.js";

/*console.log("localeString", localeString);
export const navbarButtonTextChecks =
  "&#9415;<BR>" + localeString.checks._capitalize();*/

export class NavbarBottom {
  static show(options, optionSelectedNum) {
    let navbarBottom = document.getElementsByClassName("navbar-bottom").item(0);

    while (navbarBottom.firstChild) {
      navbarBottom.removeChild(navbarBottom.firstChild);
    }

    //console.log("window.history.length", window.history.length);
    //console.log("historyLengthCurrent", historyLengthCurrent);
    //console.log("historyLengthInit", historyLengthInit);
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

    let optionNum = 0;
    for (let option of options) {
      let div = document.createElement("DIV");
      navbarBottom.appendChild(div);
      if (optionSelectedNum !== optionNum) {
        div.innerHTML = option.text;
        div.onclick = function () {
          displayData(option.href);
        };
        div.className = "navbar-bottom-div-active";
      } else if (option.text) {
        div.innerHTML = option.text;
        div.className = "navbar-bottom-div-passive";
      }
      optionNum++;
    }
  }

  static show2(optionSelectedNum) {
    NavbarBottom.show(
      [navbarButtonEntries, navbarButtonCategory, navbarButtonSummary],
      optionSelectedNum
    );
  }
}
