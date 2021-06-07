"use strict";

let urlToNavigate;
let historyDepth = 0;

/*navigator.serviceWorker.addEventListener("controllerchange", () =>
  window.location.reload()
);*/

// https://github.com/jbmoelker/serviceworker-introduction/issues/1
// https://github.com/w3c/ServiceWorker/issues/1222
/*window.AppUpdate = function () {
  console.log("window.AppUpdate", navigator.serviceWorker);
  navigator.serviceWorker.ready.then((reg) => {
    console.log("reg", reg);
    console.log("reg.waiting", reg.waiting);
    navigator.serviceWorker.addEventListener("controllerchange", () =>
      window.location.reload()
    );
    reg.waiting.postMessage({
      serviceWorker: "skipWaiting",
    });
  });
};*/
window.AppUpdate = function () {
  try {
    console.log("window.AppUpdate", navigator.serviceWorker);
    navigator.serviceWorker.ready.then((reg) => {
      console.log("reg", reg);
      console.log("reg.waiting", reg.waiting);
      navigator.serviceWorker.addEventListener("controllerchange", () =>
        window.location.reload()
      );
      reg.waiting.postMessage({
        serviceWorker: "skipWaiting",
      });
    });
  } catch (e) {
    alert(e.message);
  }
};

window.onload = function () {
  console.log("history.length", history.length);
  /* Only register a service worker if it's supported */
  // https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Offline_Service_workers
  if ("serviceWorker" in navigator) {
    const serviceWorker = "./sw.js";
    console.log('Registering of Service Worker "' + serviceWorker + '"');
    navigator.serviceWorker.register(serviceWorker).then((reg) => {
      console.log("Registration succeeded. Scope is " + reg.scope);

      reg.addEventListener("updatefound", () => {
        console.log("[Service Worker] updatefound");
        //document.getElementById("appUpdate").style.visibility = "visible";
        document.getElementById("appUpdate").style.display = "inline";
      });
    });
  }
};

window.navbarOnClick = function (navbarButton) {
  if ("back" == navbarButton.id) {
    console.log("history.length", history.length);

    if (1 == history.length) window.close();
    else history.back();
    return;
  }

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
  console.log("history.length", history.length);
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
