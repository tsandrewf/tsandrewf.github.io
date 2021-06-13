"use strict";

import {
  GetTestInsertNumber,
  IsCorrectAnswerPredicate,
} from "../../js/test.js";

window.TestConfig = {
  digitRightToLeft: false,
  testSrcWidth: 9,
  IsCorrectAnswer: IsCorrectAnswerPredicate,
  GetTest: function () {
    return GetTestInsertNumber(20);
  },
};
