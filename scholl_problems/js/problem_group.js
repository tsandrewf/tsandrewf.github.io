"use strict";

window.ProblemSelect = function (url) {
  console.log("this", this);
  console.log("self", self);
  top.Navigate(url);
};

window.onload = function () {
  const locationPathnameSplit = self.location.pathname.split("/");
  const navbarButtonActive = parent.document.getElementById(
    locationPathnameSplit[locationPathnameSplit.length - 2]
  );

  for (let navbarButton of parent.document.getElementsByClassName("navbar")[0]
    .childNodes) {
    if (navbarButton.isEqualNode(navbarButtonActive)) {
      navbarButton.className = "navbar-button-active";
    } else {
      navbarButton.className = "navbar-button-passive";
    }
  }
};

window.Test1 = function (elem) {
  top.Navigate("../test1.html?title=" + elem.innerText);
};
