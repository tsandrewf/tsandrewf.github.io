"use strict";

import { GetOperands9x9 } from "../../js/test.js";

window.TestConfig = {
  testSrcWidth: 7,
  GetTest: function () {
    const operands = GetOperands9x9();
    return "['" + operands.op1 + "&times;" + operands.op2 + "=??" + "']";
  },
};
