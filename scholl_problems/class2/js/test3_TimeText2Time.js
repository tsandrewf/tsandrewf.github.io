"use strict";

import { GetTimeRandom, GetTimeText } from "../../js/test.js";

window.TestConfig = {
  keyboard: ["digits", "enterAndDel"],
  testSrcWidth: 11,
  IsCorrectAnswer: function (elemTestSrc) {
    const matchAnswer = new RegExp(/(\d{0,2})час(\d{0,2})мин$/i).exec(
      elemTestSrc.innerText.replace(/\s/g, "")
    );
    const timeAnswer = {
      clocks: Number(matchAnswer[1]),
      minutes: Number(matchAnswer[2]),
    };

    const question = elemTestSrc.firstChild.getAttribute("time");
    const matchQuestion = new RegExp(/^(\d{0,2}):(\d{0,2})$/).exec(
      elemTestSrc.firstChild.getAttribute("time")
    );
    const timeQuestion = {
      clocks: Number(matchQuestion[1]),
      minutes: Number(matchQuestion[2]),
    };

    return (
      timeQuestion.clocks == timeAnswer.clocks &&
      timeQuestion.minutes == timeAnswer.minutes
    );
  },
  GetTest: function () {
    const time = GetTimeRandom();
    return (
      "[ \"<div style='font-size:12px;text-align:left;' time='" +
      time.clocks +
      ":" +
      time.minutes +
      "'>" +
      GetTimeText(time) +
      '</div>", "??час??мин" ]'
    );
  },
  GetLogRecordHTML: function (elemTestSrc) {
    const elemReturn = document.createElement("div");
    elemReturn.appendChild(elemTestSrc.firstChild);
    elemReturn.innerHTML += elemTestSrc.innerText;

    return elemReturn.innerHTML;
  },
};
