"use strict";

import {
  GetTestAdjacentNumbers,
  IsCorrectAgjacentNumbers,
} from "../../js/test.js";

window.TestConfig = {
  digitRightToLeft: false,
  IsCorrectAnswer: IsCorrectAgjacentNumbers,
  testSrcWidth: 8,
  GetTest: function () {
    return GetTestAdjacentNumbers(100);
  },
};
