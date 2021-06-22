"use strict";

import { GetTestAddOrSub } from "../../js/test.js";

window.TestConfig = {
  keyboard: ["digits", "enterAndDel"],
  testSrcWidth: 9,
  GetTest: function () {
    const match = new RegExp(/(\d)([+,-])(\d)/i).exec(GetTestAddOrSub(9));

    return "['" + match[1] + "0" + match[2] + match[3] + "0" + "=??" + "']";
  },
};
