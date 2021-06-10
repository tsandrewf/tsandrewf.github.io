"use strict";

import { getQueryVar } from "./getQueryVar.js";
import { RefreshLogHeight } from "./test.js";

const classAnswerDigitSelected = "answerDigitSelected";
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
      // https://learn.javascript.ru/css-units
      document.getElementById("expr1").style.width =
        TestConfig.exprWidth + "ch";
      document.getElementById("expr2").style.width =
        TestConfig.exprWidth + "ch";

      RefreshLogHeight();
    },
    false
  );
  document.body.appendChild(elemScript);

  const title = getQueryVar("title");
  document.title = title;
  document.querySelector(".title > p").innerHTML = title;

  RefreshSummary();
};

function CalcTest() {
  const test = TestConfig.GetTest();
  document.getElementById("expr1").innerHTML = test.expr1;
  document.getElementById("comparisonOperator").innerHTML = "?";
  document.getElementById("expr2").innerHTML = test.expr2;
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
  document.getElementById("expr1").innerHTML = null;
  document.getElementById("comparisonOperator").innerHTML = null;
  document.getElementById("expr2").innerHTML = null;

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

  //const regex = /(\d+\D+\d+)/i;
  const regex = /(\d+[-,\+]\d+)[>,=,<](\d+[-,\+]\d+)/i;
  const match = regex.exec(this.innerText);

  document.getElementById("expr1").innerText = match[1];
  document.getElementById("comparisonOperator").innerText = "?";
  document.getElementById("expr2").innerText = match[2];
}

window.OperationCommit = function () {
  const comparisonOperator =
    document.getElementById("comparisonOperator").innerText;
  if ("?" == comparisonOperator) return;

  dateLastDecision = Date.now();

  const logRecordHTML =
    document.getElementById("expr1").innerHTML +
    comparisonOperator +
    document.getElementById("expr2").innerHTML;

  const isCorrectAnswer = eval(
    logRecordHTML
      .replace(/\u00D7/g, "*") // &times;
      .replace(/:/g, "/")
      .replace(/=/g, "==")
  );

  const elemLog = document.getElementById("log");
  const logRecordClass = isCorrectAnswer
    ? "decisionCorrect"
    : "decisionNotCorrect";

  if (!elemLogRecordRetry) {
    const elemLogRecord = document.createElement("div");
    elemLogRecord.innerHTML = logRecordHTML;
    elemLogRecord.className = logRecordClass;

    if (!isCorrectAnswer) elemLogRecord.onclick = Retry;

    if (elemLog.firstChild)
      elemLog.insertBefore(elemLogRecord, elemLog.firstChild);
    else elemLog.appendChild(elemLogRecord);
  } else {
    elemLogRecordRetry.innerHTML = logRecordHTML;
    elemLogRecordRetry.className = logRecordClass;

    if (isCorrectAnswer && elemLogRecordRetry.onclick)
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
  document.getElementById("comparisonOperator").innerText =
    event.target.innerText;
};
