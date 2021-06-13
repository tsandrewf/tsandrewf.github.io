"use strict";

import { GetTestAddOrSub, IsCorrectAnswerPredicate } from "../../js/test.js";

window.TestConfig = {
  exprWidth: 5,
  IsCorrectAnswer: IsCorrectAnswerPredicate,
  GetTest: function () {
    return { expr1: GetTestAddOrSub(100), expr2: GetTestAddOrSub(100) };
  },
};
