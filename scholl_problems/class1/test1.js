"use strict";

const classAnswerDigitSelected = "answerDigitSelected";
let elemLogRecordRetry;

window.onload = function () {
  CalcTest();
  RefreshSummary();
};

function sklonenie(amount) {
  return (11 <= amount && 19 >= amount) ||
    0 == amount % 10 ||
    (5 <= amount % 10 && 9 >= amount % 10)
    ? "примеров"
    : 1 == amount % 10
    ? "пример"
    : "примера";
}

function RefreshSummary() {
  const elemLog = document.getElementById("log");
  const logChildCount = elemLog.childElementCount;
  const elemSummary = document.getElementById("summary");
  const logCorrectCount = document.querySelectorAll("#log > .decisionCorrect")
    .length;
  if (0 == logChildCount) {
    elemSummary.innerHTML = "Решение примеров пока не начато";
  } else if (1 == logChildCount) {
    if (1 == logCorrectCount) {
      elemSummary.innerHTML = "Решен 1 пример";
    } else {
      elemSummary.innerHTML = "Не решен 1 пример";
    }
  } else if (logCorrectCount == logChildCount) {
    elemSummary.innerHTML =
      "Решены все " + logChildCount + " " + sklonenie(logChildCount);
  } else {
    elemSummary.innerHTML =
      "Решено " +
      logCorrectCount +
      " " +
      sklonenie(logCorrectCount) +
      " из " +
      logChildCount;
  }
}

function Retry() {
  elemLogRecordRetry = this;
  document.getElementById("operand1").innerText = this.innerText.substring(
    0,
    2
  );
  document.getElementById("operation").innerText = this.innerText.substring(
    2,
    3
  );
  document.getElementById("operand2").innerText = this.innerText.substring(
    3,
    5
  );

  const elemAnswerDigit1 = document.getElementById("answerDigit1");
  const elemAnswerDigit2 = document.getElementById("answerDigit2");

  elemAnswerDigit1.innerHTML = "&nbsp;";
  elemAnswerDigit2.innerHTML = "&nbsp;";

  if (!elemAnswerDigit1.classList.contains(classAnswerDigitSelected)) {
    elemAnswerDigit1.classList.add(classAnswerDigitSelected);
    elemAnswerDigit2.classList.remove(classAnswerDigitSelected);
  }
}

window.OperationCommit = function () {
  const answerDigit1text = document.getElementById("answerDigit1").innerHTML;
  const answerDigit2text = document.getElementById("answerDigit2").innerHTML;

  if ("&nbsp;" == answerDigit1text || "&nbsp;" == answerDigit2text) {
    return;
  }

  const answer = Number(answerDigit1text) + Number(answerDigit2text) * 10;

  const elemOperand1 = document.getElementById("operand1");
  const elemOperation = document.getElementById("operation");
  const elemOperand2 = document.getElementById("operand2");

  let correctAnswer = Number(elemOperand1.innerText);
  if ("+" == elemOperation.innerText)
    correctAnswer += Number(elemOperand2.innerText);
  else correctAnswer -= Number(elemOperand2.innerText);

  const elemLog = document.getElementById("log");
  const logRecordHTML =
    elemOperand1.innerHTML +
    elemOperation.innerHTML +
    elemOperand2.innerHTML +
    (answer == correctAnswer ? "=" : "&ne;") +
    answer;
  const logRecordClass =
    answer == correctAnswer ? "decisionCorrect" : "decisionNotCorrect";

  if (!elemLogRecordRetry) {
    const elemLogRecord = document.createElement("div");
    elemLogRecord.innerHTML = logRecordHTML;
    elemLogRecord.className = logRecordClass;

    if (answer != correctAnswer) elemLogRecord.onclick = Retry;

    if (elemLog.firstChild)
      elemLog.insertBefore(elemLogRecord, elemLog.firstChild);
    else elemLog.appendChild(elemLogRecord);
  } else {
    elemLogRecordRetry.innerHTML = logRecordHTML;
    elemLogRecordRetry.className = logRecordClass;

    if (answer == correctAnswer && elemLogRecordRetry.onclick)
      elemLogRecordRetry.onclick = null;

    elemLogRecordRetry = null;
  }

  CalcTest();
  RefreshSummary();
};

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

window.SelectAnswerDigit = function (event) {
  for (let digit of document.getElementsByClassName("answerDigit")) {
    if (event.target == digit) {
      if (!digit.classList.contains(classAnswerDigitSelected))
        digit.classList.add(classAnswerDigitSelected);
    } else {
      if (digit.classList.contains(classAnswerDigitSelected))
        digit.classList.remove(classAnswerDigitSelected);
    }
  }
};

window.onKeyboardClick = function (event) {
  const answerDigit = document.getElementsByClassName(
    classAnswerDigitSelected
  )[0];
  answerDigit.innerText = event.target.innerText;
  answerDigit.classList.remove(classAnswerDigitSelected);
  if ("answerDigit1" == answerDigit.id) {
    document
      .getElementById("answerDigit2")
      .classList.add(classAnswerDigitSelected);
  } else {
    document
      .getElementById("answerDigit1")
      .classList.add(classAnswerDigitSelected);
  }
};
