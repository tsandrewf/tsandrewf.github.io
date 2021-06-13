"use strict";

import { GetOperands9x9, IsCorrectAnswerPredicate } from "../../js/test.js";

window.TestConfig = {
  digitRightToLeft: false,
  testSrcWidth: 7,
  IsCorrectAnswer: IsCorrectAnswerPredicate,
  GetTest: function () {
    const operands = GetOperands9x9();
    return operands.op1 + "&times;" + operands.op2 + "=??";
  },
};
