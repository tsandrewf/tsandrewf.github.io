"use strict";

import {
  GetTestClockfaceNumber,
  IsCorrectAnswerClockface,
} from "../../js/test.js";
import { Clockface } from "../../js/Clockface.js";

window.TestConfig = {
  keyboard: ["digits", "enterAndDel"],
  testSrcWidth: 11,
  IsCorrectAnswer: IsCorrectAnswerClockface,
  GetTest: function () {
    const test = GetTestClockfaceNumber();

    return (
      "[ new Clockface({ clocks: " +
      Math.trunc(test / 12) +
      ", minutes: " +
      (test % 12) * 5 +
      ' }).elemClockface, "??час??мин" ]'
    );
  },
  GetLogRecordHTML: function (elemTestSrc) {
    const elemReturn = document.createElement("div");
    elemReturn.appendChild(eval(elemTestSrc.getAttribute("src"))[0]);
    elemReturn.innerHTML += elemTestSrc.innerText;

    return elemReturn.innerHTML;
  },
};
