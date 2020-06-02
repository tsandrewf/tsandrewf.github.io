"use strict";

import { historyLengthIncreaseSet } from "./outlay.js";
import { setContentHeight } from "./pattern.js";

export class NavbarTop {
  static hrefOnClick() {
    historyLengthIncreaseSet();
    location.href = this.href;

    return false;
  }

  static show(options) {
    const navbarTop = document.getElementsByClassName("action-bar").item(0);

    while (navbarTop.firstChild) {
      navbarTop.removeChild(navbarTop.firstChild);
    }

    const divBack = document.createElement("DIV");
    navbarTop.appendChild(divBack);
    if (options.back) {
      divBack.onclick = function () {
        history.back();
      };
      divBack.innerHTML = "< " + options.back;
    }

    const divTitle = document.createElement("DIV");
    navbarTop.appendChild(divTitle);
    divTitle.innerHTML = options.titleHTML;
    divTitle.className = "navBarTopTitle";

    let divButtons = document.createElement("DIV");
    navbarTop.appendChild(divButtons);
    divButtons.className = "action-bar-buttons";
    for (let button of options.buttons) {
      let divButton = document.createElement("DIV");
      divButtons.appendChild(divButton);
      divButton.onclick = button.onclick;
      if (button.id) divButton.id = button.id;

      let divButtonInnerHTML = document.createElement("DIV");
      divButton.appendChild(divButtonInnerHTML);
      divButtonInnerHTML.innerHTML = button.innerHTML;
      divButtonInnerHTML.title = button.title;
    }

    setContentHeight();
  }
}
