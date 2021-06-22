"use strict";

import { GetOperands9x9 } from "../../js/test.js";

window.TestConfig = {
  keyboard: ["digits", "enterAndDel"],
  testSrcWidth: 6,
  GetTest: function () {
    const operands = GetOperands9x9();
    return (
      "['" + operands.op1 * operands.op2 + ":" + operands.op2 + "=?" + "']"
    );
  },
};
