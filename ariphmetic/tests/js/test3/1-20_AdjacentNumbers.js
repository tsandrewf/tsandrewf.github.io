"use strict";

import {
  GetTestAdjacentNumbers,
  IsCorrectAgjacentNumbers,
} from "../../js/test.js";

window.TestConfig = {
  keyboard: ["digits", "enterAndDel"],
  digitRightToLeft: false,
  IsCorrectAnswer: IsCorrectAgjacentNumbers,
  testSrcWidth: 8,
  GetTest: function () {
    //return [GetTestAdjacentNumbers(20)];
    return "['" + GetTestAdjacentNumbers(20) + "']";
  },
};
