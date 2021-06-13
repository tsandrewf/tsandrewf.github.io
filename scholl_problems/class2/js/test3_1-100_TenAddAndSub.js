"use strict";

import { GetTestAddOrSub, IsCorrectAnswerPredicate } from "../../js/test.js";

window.TestConfig = {
  digitRightToLeft: false,
  testSrcWidth: 9,
  IsCorrectAnswer: IsCorrectAnswerPredicate,
  GetTest: function () {
    const match = new RegExp(/(\d)([+,-])(\d)/i).exec(GetTestAddOrSub(9));

    return match[1] + "0" + match[2] + match[3] + "0" + "=??";
  },
};
