"use strict";

import { AddAndSubGetTest } from "../../js/test.js";

window.TestConfig = {
  digitCount: 2,
  digitRightToLeft: false,
  testSrcWidth: 5,
  GetTest: function () {
    return AddAndSubGetTest(100);
  },
};
