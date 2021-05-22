"use strict";

let urlToNavigate;
let historyDepth = 0;

window.onload = function () {
  /* Only register a service worker if it's supported */
  // https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Offline_Service_workers
  if ("serviceWorker" in navigator) {
    const serviceWorker = "./sw.js";
    console.log('Registering of Service Worker "' + serviceWorker + '"');
    /*navigator.serviceWorker
      .register(serviceWorker)
      .then(navigator.serviceWorker.ready)
      .then(function () {
        console.log(
          "navigator.serviceWorker.controller",
          navigator.serviceWorker.controller
        );
        // ToDo!
        // Почему-то в EDGE при первом запуске после регистрации worker-а
        // navigator.serviceWorker.controller = null
      });*/
    navigator.serviceWorker.register(serviceWorker).then(function (reg) {
      console.log("Registration succeeded. Scope is " + reg.scope);
    });
  }
};

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

  const elemContentWindowLocation =
    document.getElementById("content").contentWindow.location;
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
