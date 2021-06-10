"use strict";

import { AddAndSubGetTest } from "../../js/test.js";

window.TestConfig = {
  exprWidth: 5,
  GetTest: function () {
    return { expr1: AddAndSubGetTest(20), expr2: AddAndSubGetTest(20) };
  },
};
