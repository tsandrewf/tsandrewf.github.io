"use strict";

import { GetTestNumber } from "../../js/test.js";

window.TestConfig = {
  keyboard: ["digits", "enterAndDel"],
  testSrcWidth: 8,
  GetTest: function () {
    return "['" + GetTestNumber(99) + "=??+?" + "']";
  },
};
