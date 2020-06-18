"use strict";

import { historyLengthInit, historyLengthCurrent } from "./outlay.js";
import { navbarButtons } from "./locale.js";
import { paramRefresh } from "./needRefresh.js";

const navbarBottom = document.getElementsByClassName("nav-bar").item(0);

export class NavbarBottom {
  static show(options, optionSelectedNum) {
    while (navbarBottom.firstChild) {
      navbarBottom.removeChild(navbarBottom.firstChild);
    }

    /*if (navigator.standalone) {
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
    }*/

    for (let option of Object.values(navbarButtons)) {
      NavbarBottom.addButton(navbarBottom, option);
    }
  }

  static addButton(navbar, option) {
    const divButton = document.createElement("DIV");
    navbar.appendChild(divButton);
    divButton.id = option.href;
    divButton.setAttribute("funcName", option.href);
    divButton.onclick = function () {
      if ("navbar-button-active" === this.className) return;

      for (let div of document.querySelectorAll(
        ".action-bar-content > .content > div"
      )) {
        if ("none" != div.style.display) {
          paramRefresh[div.id].scrollTop = document.querySelector(
            ".action-bar-content > .content"
          ).scrollTop;
        }
      }

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
    //divText.innerHTML = option.text;
    //divText.innerHTML = option.href;
  }

  static setActiveButton(funcName) {
    NavbarBottom.setNavbarActiveButton(navbarBottom, funcName);
  }

  static setNavbarActiveButton(navbar, funcName) {
    for (let div of navbar.children) {
      div.className =
        div.getAttribute("funcName") === funcName
          ? "navbar-button-active"
          : "navbar-button-passive";
    }
  }

  static setNavbarButtonText(navbar) {
    for (let option of Object.values(navbarButtons)) {
      navbar.querySelector("#" + option.href).children[1].innerHTML =
        option.text;
    }
  }

  static setButtonText() {
    NavbarBottom.setNavbarButtonText(navbarBottom);
  }
}
