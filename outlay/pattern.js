"use strict";

export function setContentHeight() {
  const actionBarHeight = document
    .getElementsByClassName("action-bar")
    .item(0)
    .getBoundingClientRect().height;

  let minusHeght = actionBarHeight;

  if (window.innerWidth / window.innerHeight < 8 / 7) {
    minusHeght += 40;
  }

  document.getElementsByClassName("content").item(0).style.height =
    "calc(100vh - " + minusHeght + "px)";
}

window.addEventListener(
  "resize",
  function () {
    setContentHeight();
  },
  false
);
