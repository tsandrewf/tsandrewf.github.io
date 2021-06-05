"use sctrict";

import { classAnswerDigitSelected } from "../../js/test1.js";

let operandArray = new Array();

window.TestConfig = {
  digitCount: 2,
  digitRightToLeft: false,
  GetCorrectAnswer: function (operand1, operand2, operation) {
    return operand1 * operand2;
  },
  GetTest: function () {
    if (0 == operandArray.length) {
      for (let op1 = 1; op1 <= 9; op1++) {
        for (let op2 = 1; op2 <= 9; op2++) {
          operandArray.push({ op1: op1, op2: op2 });
        }
      }
    }

    let operands;
    if (1 == operandArray.length) {
      operands = operandArray[0];
    } else {
      const index = Math.floor(Math.random() * operandArray.length);
      operands = operandArray[index];
      operandArray.splice(index, 1);
    }

    return {
      operand1: operands.op1,
      operand2: operands.op2,
      operation: "&times;",
    };
  },
};
