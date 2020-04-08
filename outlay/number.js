"use strict";

Number.prototype._round = function (decimal) {
  return Number(this.toFixed(decimal));
};
