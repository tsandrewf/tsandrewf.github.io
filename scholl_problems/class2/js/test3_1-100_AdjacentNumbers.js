"use strict";

import { GetTestAdjacentNumbers } from "../../js/test.js";

window.TestConfig = {
  testSrcWidth: 8,
  GetTest: function () {
    return "['" + GetTestAdjacentNumbers(20) + "']";
  },
};
