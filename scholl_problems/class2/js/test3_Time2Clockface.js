"use strict";

import {
  GetTestClockfaceNumber,
  IsCorrectAnswerClockface,
} from "../../js/test.js";
import { Clockface } from "../../js/Clockface.js";

window.TestConfig = {
  keyboard: ["rotation", "enter"],
  testSrcWidth: 11,
  IsCorrectAnswer: IsCorrectAnswerClockface,
  GetTest: function () {
    const test = GetTestClockfaceNumber();

    return (
      "[ '" +
      Math.trunc(test / 12) +
      "час" +
      (test % 12) * 5 +
      "мин'" +
      ", new Clockface({ clocks: 0, minutes: 0 }).elemClockface ]"
    );
  },
  GetLogRecordHTML: function (elemTestSrc) {
    const elemReturn = document.createElement("div");
    elemReturn.innerHTML = elemTestSrc.innerText;
    elemReturn.appendChild(eval(elemTestSrc.getAttribute("src"))[1]);

    return elemReturn.innerHTML;
  },
};
