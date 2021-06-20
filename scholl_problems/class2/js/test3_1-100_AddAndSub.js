"use strict";

import { GetTestAddOrSub } from "../../js/test.js";

window.TestConfig = {
  testSrcWidth: 9,
  GetTest: function () {
    return "['" + GetTestAddOrSub(99) + "=??" + "']";
  },
};
