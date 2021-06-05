"use strict";

import { getQueryVar } from "./getQueryVar.js";

export const classAnswerDigitSelected = "answerDigitSelected";
let elemLogRecordRetry;
let dateTestBeg;
let dateLastDecision;

window.onload = function () {
  const elemScript = document.createElement("script");
  elemScript.src = getQueryVar("script");
  elemScript.type = "module";
  elemScript.async = true;
  elemScript.addEventListener(
    "load",
    function (e) {
      const elemAnswerDigits = document.getElementById("answerDigits");
      for (let i = 0; i < TestConfig.digitCount; i++) {
        const elemDigit = document.createElement("span");
        elemDigit.onclick = "SelectAnswerDigit(event);";
        elemDigit.classList = "answerDigit oneDigit";
        elemAnswerDigits.appendChild(elemDigit);
      }
    },
    false
  );
  document.body.appendChild(elemScript);

  const title = getQueryVar("title");
  document.title = title;
  document.querySelector(".title > p").innerHTML = title;

  RefreshSummary();

  RefreshLogHeight();
};

function CalcTest() {
  const test = TestConfig.GetTest();
  document.getElementById("operand1").innerText = test.operand1;
  document.getElementById("operand2").innerText = test.operand2;
  document.getElementById("operation").innerHTML = test.operation;

  InitDigitSelected();
}

function RefreshLogHeight() {
  // Beg Подгоняем высоту елемента "log" под высоту окна
  const elemLog = document.getElementById("log");
  elemLog.style.height =
    (window.innerHeight - elemLog.getBoundingClientRect().top).toString() +
    "px";
  // End Подгоняем высоту елемента "log" под высоту окна
}

function InitDigitSelected() {
  const elemArrayAnswerDigit = document.getElementsByClassName("answerDigit");
  for (let elemAnswerDigit of elemArrayAnswerDigit) {
    elemAnswerDigit.innerHTML = "&nbsp;";
    elemAnswerDigit.classList.remove(classAnswerDigitSelected);
  }

  elemArrayAnswerDigit[
    TestConfig.digitRightToLeft ? elemArrayAnswerDigit.length - 1 : 0
  ].classList.add(classAnswerDigitSelected);
}

window.onresize = function () {
  RefreshLogHeight();
};

window.Start = function () {
  {
    // Erase Log
    const elemLog = document.getElementById("log");
    while (elemLog.firstChild) {
      elemLog.removeChild(elemLog.firstChild);
    }
  }

  CalcTest();

  document.getElementById("summaryText").innerHTML = "Тест начат";
  dateTestBeg = Date.now();

  document.getElementById("start").disabled = true;
  document.getElementById("start").className = "disabled";

  document.getElementById("stop").disabled = false;
  document.getElementById("stop").className = "enabled";

  document.getElementById("keyboard").disabled = false;
};

window.Stop = function () {
  document.getElementById("operand1").innerHTML = null;
  document.getElementById("operation").innerHTML = null;
  document.getElementById("operand2").innerHTML = null;

  for (let elemAnswerDigit of document.getElementsByClassName("answerDigit")) {
    elemAnswerDigit.innerHTML = null;
  }

  document.getElementById("start").disabled = false;
  document.getElementById("start").className = "enabled";

  document.getElementById("stop").disabled = true;
  document.getElementById("stop").className = "disabled";

  document.getElementById("keyboard").disabled = true;

  if (!dateLastDecision) {
    dateTestBeg = null;
    document.getElementById("summaryText").innerHTML = "Тест пока не начат";

    return;
  }

  const ellapsedTime = Math.trunc((dateLastDecision - dateTestBeg) / 1000);
  const ellapsedTimeSeconds = ellapsedTime % 60;
  const ellapsedTimeMinutes = Math.trunc(ellapsedTime / 60);

  document.getElementById("summaryText").innerHTML +=
    " за" +
    (0 < ellapsedTimeMinutes ? " " + ellapsedTimeMinutes + " мин." : "") +
    (0 < ellapsedTimeSeconds ? " " + ellapsedTimeSeconds + " сек." : "");
  dateLastDecision = null;

  dateTestBeg = null;
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
  const elemSummary = document.getElementById("summaryText");
  const logCorrectCount = document.querySelectorAll(
    "#log > .decisionCorrect"
  ).length;
  if (0 == logChildCount) {
    elemSummary.innerHTML = "Тест пока не начат";
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

  const regex = /(\d+)(\D+)(\d+)/i;
  const match = regex.exec(this.innerText);

  document.getElementById("operand1").innerText = match[1];
  document.getElementById("operation").innerText = match[2];
  document.getElementById("operand2").innerText = match[3];

  InitDigitSelected();
}

window.OperationCommit = function () {
  if (document.getElementById("keyboard").disabled) return;

  dateLastDecision = Date.now();

  const regexp = /^\d/;
  let answer = null;
  for (let elemAnswerDigit of document.getElementsByClassName("answerDigit")) {
    if (null == answer) {
      if (regexp.test(elemAnswerDigit.innerHTML)) {
        answer = Number(elemAnswerDigit.innerHTML);
      }
    } else {
      if (regexp.test(elemAnswerDigit.innerHTML)) {
        answer = 10 * answer + Number(elemAnswerDigit.innerHTML);
      }
    }
  }
  if (null == answer) return;

  const elemOperand1 = document.getElementById("operand1");
  const elemOperation = document.getElementById("operation");
  const elemOperand2 = document.getElementById("operand2");

  const correctAnswer = TestConfig.GetCorrectAnswer(
    Number(elemOperand1.innerText),
    Number(elemOperand2.innerText),
    elemOperation.innerText
  );

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
  if (document.getElementById("keyboard").disabled) return;

  const answerDigit = document.getElementsByClassName(
    classAnswerDigitSelected
  )[0];
  answerDigit.innerText = event.target.innerText;
  answerDigit.classList.remove(classAnswerDigitSelected);

  let elemAnswerDigitIndex = 0;
  const elemArrayAnswerDigit = document.getElementsByClassName("answerDigit");
  for (let elemAnswerDigit of elemArrayAnswerDigit) {
    if (answerDigit.isEqualNode(elemAnswerDigit)) break;
    elemAnswerDigitIndex++;
  }

  if (TestConfig.digitRightToLeft) {
    elemAnswerDigitIndex =
      elemArrayAnswerDigit.length - 1 == elemAnswerDigitIndex
        ? 0
        : elemAnswerDigitIndex + 1;
  } else {
    elemAnswerDigitIndex =
      0 == elemAnswerDigitIndex
        ? elemArrayAnswerDigit.length - 1
        : elemAnswerDigitIndex - 1;
  }

  elemArrayAnswerDigit[elemAnswerDigitIndex].classList.add(
    classAnswerDigitSelected
  );
};
