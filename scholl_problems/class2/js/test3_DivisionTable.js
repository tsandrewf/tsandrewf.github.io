"use strict";

import { GetOperands9x9, IsCorrectAnswerPredicate } from "../../js/test.js";

window.TestConfig = {
  digitRightToLeft: false,
  testSrcWidth: 6,
  IsCorrectAnswer: IsCorrectAnswerPredicate,
  GetTest: function () {
    const operands = GetOperands9x9();
    return operands.op1 * operands.op2 + ":" + operands.op2 + "=?";
  },
};
