"use sctrict";

import { classAnswerDigitSelected } from "../../js/test1.js";

let operandArray = new Array();
for (let op1 = 1; op1 <= 9; op1++) {
  for (let op2 = 1; op2 <= 9; op2++) {
    operandArray.push({ op1: op1, op2: op2 });
  }
}

window.CalcTest = function () {
  let operands;
  if (0 == operandArray.length) {
    // ToDo! All digits finished
  } else if (1 == operandArray.length) {
    operands = operandArray[0];
  } else {
    const index = Math.floor(Math.random() * operandArray.length);
    operands = operandArray[index];
    operandArray.splice(index, 1);
  }

  document.getElementById("operand1").innerText = operands.op1;
  document.getElementById("operation").innerHTML = "&times;";
  document.getElementById("operand2").innerText = operands.op2;

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
  return operand1 * operand2;
};
