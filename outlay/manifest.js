"use strict";

const manifestLocales = {
  ar: {
    name: "التكلفة",
    short_name: "التكلفة",
    description: "محاسبة النفقات المالية الشخصية",
  },
  bg: {
    name: "Разходи",
    short_name: "Разходи",
    description: "Отчитане на лични финансови разходи",
  },
  da: {
    name: "Udgifter",
    short_name: "Udgifter",
    description: "Regnskab for personlige økonomiske udgifter",
  },
  de: {
    name: "Ausgaben",
    short_name: "Ausgaben",
    description: "Bilanzierung persönlicher finanzieller ausgaben",
  },
  el: {
    name: "Εξοδα",
    short_name: "Εξοδα",
    description: "Λογιστική για προσωπικά οικονομικά έξοδα",
  },
  en: {
    name: "Outlays",
    short_name: "Outlays",
    description: "Accounting of personal financial outlays",
  },
  es: {
    name: "Desembolsos",
    short_name: "Desembolsos",
    description: "Contabilidad de desembolsos financieros personales",
  },
  fa: {
    name: "هزینه ها",
    short_name: "هزینه ها",
    description: "حسابداری برای هزینه های مالی شخصی",
  },
  fi: {
    name: "Kulut",
    short_name: "Kulut",
    description: "Henkilökohtaisten rahoituskulujen kirjanpito",
  },
  fr: {
    name: "Dépenses",
    short_name: "Dépenses",
    description: "Comptabilité des dépenses financières personnelles",
  },
  hi: {
    name: "लागत",
    short_name: "लागत",
    description: "व्यक्तिगत वित्तीय खर्च के लिए लेखांकन",
  },
  it: {
    name: "Costi",
    short_name: "Costi",
    description: "Contabilizzazione di spese finanziarie personali",
  },
  iw: {
    name: "העלויות",
    short_name: "העלויות",
    description: "חשבונאות להוצאות כספיות אישיות",
  },
  ja: {
    name: "費用",
    short_name: "費用",
    description: "個人の金融費用の会計",
  },
  ko: {
    name: "경비",
    short_name: "경비",
    description: "개인 재정 비용 회계",
  },
  ms: {
    name: "Kosnya",
    short_name: "Kosnya",
    description: "Mengira perbelanjaan kewangan peribadi",
  },
  nl: {
    name: "Uitgaven",
    short_name: "Uitgaven",
    description: "Boekhouding van persoonlijke financiële uitgaven",
  },
  no: {
    name: "Utgifter",
    short_name: "Utgifter",
    description: "Regnskap for personlige økonomiske utgifter",
  },
  pl: {
    name: "Wydatki",
    short_name: "Wydatki",
    description: "Rozliczanie osobistych kosztów finansowych",
  },
  pt: {
    name: "Custo",
    short_name: "Custo",
    description: "Contabilização de despesas financeiras pessoais",
  },
  ro: {
    name: "Cheltuieli",
    short_name: "Cheltuieli",
    description: "Contabilitate pentru cheltuieli financiare personale",
  },
  ru: {
    name: "Затраты",
    short_name: "Затраты",
    description: "Учет личных финансовых затрат",
  },
  sv: {
    name: "Kostnader",
    short_name: "Kostnader",
    description: "Redovisning av personliga finansiella kostnader",
  },
  tr: {
    name: "Maliyetler",
    short_name: "Maliyetler",
    description: "Kişisel finansal giderlerin muhasebeleştirilmesi",
  },
  zh: {
    name: "费用",
    short_name: "费用",
    description: "个人财务费用会计",
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
