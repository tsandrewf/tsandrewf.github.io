"use strict";

import { historyLengthInit, historyLengthCurrent } from "./outlay.js";

export class NavbarBottom {
  static show(options) {
    console.log("navigator.standalone", navigator.standalone);
    let navbarBottom = document.getElementsByClassName("navbar-bottom").item(0);

    while (navbarBottom.firstChild) {
      navbarBottom.removeChild(navbarBottom.firstChild);
    }

    //console.log("window.history.length", window.history.length);
    //console.log("historyLengthCurrent", historyLengthCurrent);
    //console.log("historyLengthInit", historyLengthInit);
    if (navigator.standalone && 0 < historyLengthCurrent - historyLengthInit) {
      let div = document.createElement("DIV");
      navbarBottom.appendChild(div);
      let a = document.createElement("A");
      div.appendChild(a);
      a.innerHTML = "<";
      a.href = "Javascript:window.history.back();";
      div.style.width = "1vw";
    }

    for (let option of options) {
      let div = document.createElement("DIV");
      navbarBottom.appendChild(div);
      if (option.href) {
        let a = document.createElement("A");
        div.appendChild(a);
        a.innerHTML = option.text;
        a.href = option.href;
      } else if (option.text) {
        div.innerHTML = option.text;
      }
    }
  }
}
