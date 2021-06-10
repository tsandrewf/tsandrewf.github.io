"use strict";

window.TestConfig = {
  digitCount: 2,
  digitRightToLeft: true,
  testSrcWidth: 5,
  GetTest: function () {
    const operand1 = 20 + Math.trunc(70 * Math.random());
    const operation = 0.5 < Math.random() ? "+" : "-";

    let digit11 = operand1.toString().charAt(1);
    let digit12 = operand1.toString().charAt(0);

    let digit21;
    let digit22;
    if ("+" == operation) {
      digit21 = Math.trunc((9 - digit11) * Math.random());
      digit22 = Math.trunc((9 - digit12) * Math.random()) + 1;
    } else {
      digit21 = Math.trunc(digit11 * Math.random());
      digit22 = Math.trunc((digit12 - 1) * Math.random()) + 1;
    }

    return operand1 + operation + (digit21 + digit22 * 10);
  },
};
