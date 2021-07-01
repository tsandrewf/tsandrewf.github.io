"use strict";

import { GetTestInsertNumber } from "../../js/test.js";

window.TestConfig = {
  keyboard: ["digits", "enterAndDel"],
  testSrcWidth: 9,
  GetTest: function () {
    return "['" + GetTestInsertNumber(20) + "']";
  },
};
