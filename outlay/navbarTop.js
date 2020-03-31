"use strict";

import { historyLengthIncreaseSet } from "./outlay.js";

export class NavbarTop {
  static hrefOnClick() {
    historyLengthIncreaseSet();
    location.href = this.href;

    return false;
  }

  static show(options) {
    let navbarTop = document.getElementsByClassName("navbar-top").item(0);

    while (navbarTop.firstChild) {
      navbarTop.removeChild(navbarTop.firstChild);
    }

    if (options.menu) {
      let divMenu = document.createElement("DIV");
      navbarTop.appendChild(divMenu);
      divMenu.className = "dropdown";

      let buttonMenu = document.createElement("BUTTON");
      divMenu.appendChild(buttonMenu);
      buttonMenu.className = "dropbtn";
      buttonMenu.innerHTML = options.menu.buttonHTML;

      let divDropdownContent = document.createElement("DIV");
      divMenu.appendChild(divDropdownContent);
      divDropdownContent.className = "dropdown-content";
      for (let menuContentItem of options.menu.content) {
        let aMenuContentItem = document.createElement("A");
        divDropdownContent.appendChild(aMenuContentItem);
        aMenuContentItem.innerHTML = menuContentItem.innerHTML;
        aMenuContentItem.href = menuContentItem.href;
        aMenuContentItem.onclick = NavbarTop.hrefOnClick;
      }

      const divTitle = document.createElement("DIV");
      navbarTop.appendChild(divTitle);
      divTitle.innerHTML = options.titleHTML;
      divTitle.className = "navBarTopTitle";

      let divButtons = document.createElement("DIV");
      navbarTop.appendChild(divButtons);
      divButtons.className = "buttons";
      for (let button of options.buttons) {
        let divButton = document.createElement("DIV");
        divButtons.appendChild(divButton);
        divButton.className = "button";
        divButton.onclick = button.onclick;
        if (button.id) divButton.id = button.id;

        let divButtonInnerHTML = document.createElement("DIV");
        divButton.appendChild(divButtonInnerHTML);
        divButtonInnerHTML.innerHTML = button.innerHTML;
      }
    }
  }
}
