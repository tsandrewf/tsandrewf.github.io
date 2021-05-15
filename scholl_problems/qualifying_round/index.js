"use strict";

window.menuClick = function () {
  document.getElementById("ifContent").src =
    "problem" + event.target.innerText.replace("Задача ", "") + ".html";
};
