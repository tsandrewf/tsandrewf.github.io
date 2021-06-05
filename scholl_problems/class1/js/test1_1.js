"use strict";

import { classAnswerDigitSelected } from "../../js/test1.js";

window.CalcTest = function () {
  const operand1 = 20 + Math.trunc(70 * Math.random());
  const operation = 0.5 < Math.random() ? "+" : "-";

  document.getElementById("operand1").innerText = operand1;
  document.getElementById("operation").innerText = operation;

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

  document.getElementById("operand2").innerText = digit21 + digit22 * 10;

  {
    const answerDigit1 = document.getElementById("answerDigit1");
    answerDigit1.innerHTML = "&nbsp;";
    if (!answerDigit1.classList.contains(classAnswerDigitSelected))
      answerDigit1.classList.add(classAnswerDigitSelected);
  }

  {
    const answerDigit2 = document.getElementById("answerDigit2");
    answerDigit2.innerHTML = "&nbsp;";
    if (answerDigit2.classList.contains(classAnswerDigitSelected))
      answerDigit2.classList.remove(classAnswerDigitSelected);
  }
};

window.GetCorrectAnswer = function (operand1, operand2, operation) {
  return operand1 + ("+" == operation ? operand2 : -operand2);
};
