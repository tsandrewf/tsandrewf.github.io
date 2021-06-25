"use strict";

import { GetTimeRandom, GetTimeText } from "../../js/test.js";
import { Clockface } from "../../js/Clockface.js";

window.TestConfig = {
  keyboard: ["rotation", "enter"],
  testSrcWidth: 11,
  IsCorrectAnswer: function (elemTestSrc) {
    const question = elemTestSrc.firstChild.getAttribute("time");
    const matchQuestion = new RegExp(/^(\d{0,2}):(\d{0,2})$/).exec(
      elemTestSrc.firstChild.getAttribute("time")
    );
    const timeQuestion = {
      clocks: Number(matchQuestion[1]),
      minutes: Number(matchQuestion[2]),
    };

    const timeAnswer = new Clockface(elemTestSrc.getElementsByTagName("svg")[0])
      .time;

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
      '</div>", new Clockface({ clocks: 0, minutes: 0 }).elemClockface ]'
    );
  },

  GetLogRecordHTML: function (elemTestSrc) {
    const elemReturn = document.createElement("div");
    elemReturn.appendChild(elemTestSrc.firstChild);
    elemReturn.innerHTML += elemTestSrc.innerText;

    return elemReturn.innerHTML;
  },
};
