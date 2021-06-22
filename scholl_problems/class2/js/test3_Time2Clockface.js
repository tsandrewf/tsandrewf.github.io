"use strict";

import { GetTestClockfaceNumber } from "../../js/test.js";
import { Clockface } from "../../js/Clockface.js";

window.TestConfig = {
  keyboard: ["rotation"],
  testSrcWidth: 11,
  IsCorrectAnswer: function (elemTestSrc) {
    const match = new RegExp(/(\d{1,2})час(\d{1,2})мин/i).exec(
      elemTestSrc.innerText
    );
    const timeDigit = {
      clocks: Number(match[1]),
      minutes: Number(match[2]),
    };
    const svgClockface = elemTestSrc.getElementsByTagName("svg")[0];
    const timeClockface = {
      clocks: Number(svgClockface.getAttribute("clocks")),
      minutes: Number(svgClockface.getAttribute("minutes")),
    };

    return (
      timeDigit.clocks == timeClockface.clocks &&
      timeDigit.minutes == timeClockface.minutes
    );
  },
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
