"use strict";

import { GetTestAddOrSub, IsCorrectAnswerPredicate } from "../../js/test.js";

window.TestConfig = {
  digitRightToLeft: false,
  IsCorrectAnswer: IsCorrectAnswerPredicate,
  testSrcWidth: 9,
  GetTest: function () {
    return GetTestAddOrSub(99) + "=??";
  },
};
