"use strict";

import { getQueryVar } from "./getQueryVar.js";
import {
  RefreshLogHeight,
  GetTestAddOrSub,
  GetTestAdjacentNumbers,
  GetTestInsertNumber,
  IsCorrectAnswerPredicate,
} from "./test.js";
import { Clockface } from "./Clockface.js";

export const answerDigitHTML =
  '<span class="answerDigit oneDigit" onclick="AnswerDigitSelect(this)"></span>';

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
      document.getElementById("testSrc").style.width =
        TestConfig.testSrcWidth + "ch";

      for (let displayKeyboardClass of TestConfig.keyboard
        ? TestConfig.keyboard
        : ["digits"]) {
        for (let elemKeyboard of document.getElementsByClassName(
          displayKeyboardClass
        )) {
          elemKeyboard.style.display = "table-row";
        }
      }

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

window.AnswerDigitSelect = function (elemAnswerDigit) {
  document
    .getElementsByClassName(classAnswerDigitSelected)[0]
    .classList.remove(classAnswerDigitSelected);
  elemAnswerDigit.classList.add(classAnswerDigitSelected);
};

function SetTest(testSrcExpr) {
  const testSrc = eval(testSrcExpr);
  if (!Array.isArray(testSrc)) {
    throw "Parameter of function SetTest must be array";
  }
  const elemTestSrc = document.getElementById("testSrc");

  while (elemTestSrc.firstChild) {
    elemTestSrc.removeChild(elemTestSrc.firstChild);
  }

  elemTestSrc.setAttribute("src", testSrcExpr);
  for (let elem of testSrc) {
    if ("string" == typeof elem) {
      elemTestSrc.innerHTML += elem.replace(/\?/g, answerDigitHTML);
    } else {
      elemTestSrc.appendChild(elem);
    }
  }

  InitDigitSelected();

  // ToDo!
  RefreshLogHeight();
}

function CalcTest() {
  SetTest(TestConfig.GetTest());
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
  document.getElementById("testSrc").innerHTML = "&nbsp;";

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

  // ToDo!
  RefreshLogHeight();
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
      (1 == logCorrectCount ? "Решен" : "Решено") +
      " " +
      logCorrectCount +
      " " +
      sklonenie(logCorrectCount) +
      " из " +
      logChildCount;
  }
}

function Retry() {
  elemLogRecordRetry = this;
  SetTest(this.getAttribute("src"));
}

window.OperationDelete = function () {
  document.getElementsByClassName(classAnswerDigitSelected)[0].innerHTML =
    "&nbsp;";
};

window.OperationCommit = function () {
  if (document.getElementById("keyboard").disabled) return;

  dateLastDecision = Date.now();

  /*const regexp = /^\d/;
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
  if (null == answer) return;*/

  const elemTestSrc = document.getElementById("testSrc");

  const isCorrectAnswer = TestConfig.IsCorrectAnswer
    ? TestConfig.IsCorrectAnswer(elemTestSrc)
    : IsCorrectAnswerPredicate(elemTestSrc);

  const elemLog = document.getElementById("log");

  const logRecordHTML = TestConfig.GetLogRecordHTML
    ? TestConfig.GetLogRecordHTML(elemTestSrc)
    : isCorrectAnswer
    ? elemTestSrc.innerText.replace(/\s/g, "")
    : elemTestSrc.innerText.replace(/\s/g, "").replace("=", "&ne;");

  const logRecordClass = isCorrectAnswer
    ? "decisionCorrect"
    : "decisionNotCorrect";

  if (!elemLogRecordRetry) {
    const elemLogRecord = document.createElement("div");
    elemLogRecord.innerHTML = logRecordHTML;
    elemLogRecord.className = logRecordClass;

    if (!isCorrectAnswer) {
      elemLogRecord.onclick = Retry;
      elemLogRecord.setAttribute("src", elemTestSrc.getAttribute("src"));
    }

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
  if (document.getElementById("keyboard").disabled) return;

  const elemAnswerDigitSelected = document.getElementsByClassName(
    classAnswerDigitSelected
  )[0];
  elemAnswerDigitSelected.innerText = event.target.innerText;
  elemAnswerDigitSelected.classList.remove(classAnswerDigitSelected);

  const elemArrayAnswerDigit = document.getElementsByClassName("answerDigit");

  let elemAnswerDigitIndex = Array.from(elemArrayAnswerDigit).indexOf(
    elemAnswerDigitSelected
  );

  if (TestConfig.digitRightToLeft) {
    elemAnswerDigitIndex =
      0 == elemAnswerDigitIndex
        ? elemArrayAnswerDigit.length - 1
        : elemAnswerDigitIndex - 1;
  } else {
    elemAnswerDigitIndex =
      elemArrayAnswerDigit.length - 1 == elemAnswerDigitIndex
        ? 0
        : elemAnswerDigitIndex + 1;
  }

  elemArrayAnswerDigit[elemAnswerDigitIndex].classList.add(
    classAnswerDigitSelected
  );
};
