"use strict";

import { GetTestAddOrSub } from "../../js/test.js";

window.TestConfig = {
  keyboard: ["digits", "enterAndDel"],
  testSrcWidth: 9,
  GetTest: function () {
    return "['" + GetTestAddOrSub(19) + "=??" + "']";
  },
};
