"use strict";

import { GetTestAddOrSub } from "../../js/test.js";

window.TestConfig = {
  keyboard: ["comparison"],
  testSrcWidth: 11,
  GetTest: function () {
    return "['" + GetTestAddOrSub(100) + "?" + GetTestAddOrSub(100) + "']";
  },
};
