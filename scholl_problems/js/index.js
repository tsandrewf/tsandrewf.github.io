"use strict";

let urlToNavigate;
let historyDepth = 0;

window.navbarOnClick = function (navbarButton) {
  if ("navbar-button-active" == navbarButton.className) return;

  if (historyDepth) {
    urlToNavigate = navbarButton.id + "/";
    history.go(-historyDepth);
  } else {
    urlToNavigate = null;
    document
      .getElementById("content")
      .contentWindow.location.replace(navbarButton.id + "/");
  }
};

window.onpopstate = function (event) {
  let url;
  if (urlToNavigate) {
    url = urlToNavigate;
    urlToNavigate = null;
    historyDepth = 0;
  } else {
    url = event.state.url;
    historyDepth--;
  }

  document.getElementById("content").contentWindow.location.replace(url);
};

window.Navigate = function (url) {
  historyDepth++;

  const elemContentWindowLocation = document.getElementById("content")
    .contentWindow.location;
  history.replaceState(
    {
      url:
        elemContentWindowLocation.pathname + elemContentWindowLocation.search,
    },
    window.title
  );
  elemContentWindowLocation.replace(url);
  history.pushState({ url: url }, window.title);
};
