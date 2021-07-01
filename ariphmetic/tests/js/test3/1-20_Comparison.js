"use strict";

import { GetTestAddOrSub } from "../../js/test.js";

window.TestConfig = {
  keyboard: ["comparison", "enterAndDel"],
  testSrcWidth: 11,
  GetTest: function () {
    return "['" + GetTestAddOrSub(20) + "?" + GetTestAddOrSub(20) + "']";
  },
};
