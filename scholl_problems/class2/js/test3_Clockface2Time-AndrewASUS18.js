"use strict";

import { GetTestClockfaceNumber } from "../../js/test.js";

window.TestConfig = {
  digitRightToLeft: false,
  IsCorrectAnswer: function (elemTestSrc) {
    const answerDigits = elemTestSrc.getElementsByClassName("answerDigit");
    const answer = {
      clocks: Number(answerDigits[0].innerText + answerDigits[1].innerText),
      minutes: Number(answerDigits[2].innerText + answerDigits[3].innerText),
    };

    const svgClockface = elemTestSrc.firstChild;
    const question = {
      clocks: Number(svgClockface.getAttribute("clocks")),
      minutes: Number(svgClockface.getAttribute("minutes")),
    };

    return (
      answer.clocks == question.clocks && answer.minutes == question.minutes
    );
  },
  testSrcWidth: 13,
  GetTest: function () {
    const test = GetTestClockfaceNumber();

    return (
      "[ new Clockface({ clocks: " +
      Math.trunc(test / 12) +
      ", minutes: " +
      (test % 12) * 5 +
      ', color: window.getComputedStyle(document.getElementById("testSrc")).color, }).elemClockface, "??час. ??мин.", ]'
    );
  },
};
