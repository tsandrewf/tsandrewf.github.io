"use strict";

const manifestLocales = {
  en: {
    name: "Outlays",
    short_name: "Outlays",
    description: "Accounting of personal financial outlays",
  },
  ru: {
    name: "Затраты",
    short_name: "Затраты",
    description: "Учет личных финансовых затрат",
  },
};

// https://web-artcraft.com/blog/posagovoe-sozdanie-dinamiceskogo-manifesta-dla-skripta-service-worker-i-dobavlenie-ikonki-sajta-na-rabocij-stol
// https://github.com/Web-Art-Craft/dynamic-manifest
function generateManifest() {
  const scope = window.location.href.replace("outlay.html", "");

  let userLangCode = (navigator.language || navigator.userLanguage)
    .substr(0, 2)
    .toLowerCase();

  if (!Object.getOwnPropertyDescriptor(manifestLocales, userLangCode)) {
    userLangCode = "en";
  }

  const manifestLocale = manifestLocales[userLangCode];

  const myDynamicManifest = {
    name: manifestLocale.name,
    short_name: manifestLocale.short_name,
    description: manifestLocale.description,

    //scope: window.location.href,
    start_url: window.location.href,

    display: "standalone",
    background_color: "#fff",
    default_locale: "en",
    theme_color: "red",
    icons: [
      {
        src: scope + "icons/outlay32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: scope + "icons/outlay48.png",
        sizes: "48x48",
        type: "image/png",
      },
      {
        src: scope + "icons/outlay72.png",
        sizes: "72x72",
        type: "image/png",
      },
      {
        src: scope + "icons/outlay96.png",
        sizes: "96x96",
        type: "image/png",
      },
      {
        src: scope + "icons/outlay128.png",
        sizes: "128x128",
        type: "image/png",
      },
      {
        src: scope + "icons/outlay256.png",
        sizes: "256x256",
        type: "image/png",
      },
      {
        src: scope + "icons/outlay512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
  const stringManifest = JSON.stringify(myDynamicManifest);
  const blob = new Blob([stringManifest], { type: "application/json" });
  const manifestURL = URL.createObjectURL(blob);
  console.log("manifestURL", manifestURL);
  console.log("window.location.host", window.location.host);
  console.log("window.location.hostname", window.location.hostname);
  console.log("window.location.href", window.location.href);
  console.log("window.location.origin", window.location.origin);
  console.log("window.location.pathname", window.location.pathname);
  console.log("window.location.search", window.location.search);
  console.log(
    "window.location",
    window.location.href.replace("outlay.html", "")
  );
  document.querySelector("#custom-manifest").setAttribute("href", manifestURL);
}

window.addEventListener("DOMContentLoaded", () => {
  generateManifest();
});
