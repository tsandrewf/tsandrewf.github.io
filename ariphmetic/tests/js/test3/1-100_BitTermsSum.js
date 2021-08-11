"use strict";

import { GetTestNumber, IsCorrectAnswerBitTermsSum } from "../../js/test.js";

window.TestConfig = {
  keyboard: ["digits", "enterAndDel"],
  testSrcWidth: 8,
  GetTest: function () {
    return "['" + GetTestNumber(99) + "=??+?" + "']";
  },
  IsCorrectAnswer: IsCorrectAnswerBitTermsSum,
};
