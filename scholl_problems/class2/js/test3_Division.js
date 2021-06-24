"use strict";

import { GetTestNumber } from "../../js/test.js";

const scripts = document.getElementsByTagName("script");
const match = /number=(\d)$/.exec(scripts[scripts.length - 1].src);

window.TestConfig = {
  keyboard: ["digits", "enterAndDel"],
  testSrcWidth: 7,
  GetTest: function () {
    return "['" + match[1] * GetTestNumber(9) + ":" + match[1] + "=??" + "']";
  },
};
