"use strict";

function padStr(i) {
  return i < 10 ? "0" + i : "" + i;
}

Date.prototype._prevDay = function() {
  return new Date(this.getTime() - 1000 * 60 * 60 * 24);
};

Date.prototype._toCurrent = function() {
  return (
    this.getFullYear() +
    padStr(this.getMonth() + 1) +
    padStr(this.getDate()) +
    padStr(this.getHours()) +
    padStr(this.getMinutes()) +
    padStr(this.getSeconds())
  );
};

Date.prototype._toForm = function() {
  return (
    this.getFullYear() +
    "-" +
    padStr(this.getMonth() + 1) +
    "-" +
    padStr(this.getDate())
  );
};

Date.prototype._toStringBrief = function() {
  return (
    padStr(this.getDate()) +
    "." +
    padStr(this.getMonth() + 1) +
    "." +
    this.getFullYear()
  );
};

Date.prototype._toStringBriefWithTime = function() {
  return (
    padStr(this.getDate()) +
    "." +
    padStr(this.getMonth() + 1) +
    "." +
    this.getFullYear() +
    " " +
    padStr(this.getHours()) +
    ":" +
    padStr(this.getMinutes()) +
    ":" +
    padStr(this.getSeconds())
  );
};

Date.prototype._getDayEnd = function() {
  return new Date(this.setHours(23, 59, 59, 999));
};

Date.prototype._getWeekBeg = function() {
  return new Date(
    new Date(
      new Date(this).setDate(this.getDate() - ((this.getDay() - 1) % 7))
    ).setHours(0, 0, 0, 0)
  );
};

Date.prototype._getMonthBeg = function() {
  return new Date(new Date(new Date(this).setDate(1)).setHours(0, 0, 0, 0));
};

// https://stackoverflow.com/questions/222309/calculate-last-day-of-month-in-javascript
Date.prototype._getMonthEnd = function() {
  return new Date(
    new Date(this.getFullYear(), this.getMonth() + 1, 0).setHours(
      23,
      59,
      59,
      999
    )
  );
};

Date.prototype._getYearBeg = function() {
  return new Date(
    new Date(new Date(new Date(this).setDate(1)).setMonth(0)).setHours(
      0,
      0,
      0,
      0
    )
  );
};

Date.prototype._getMonthString = function() {
  const monthNames = [
    "январь",
    "февраль",
    "март",
    "апрель",
    "май",
    "июнь",
    "июль",
    "август",
    "сентябрь",
    "октябрь",
    "ноябрь",
    "декабрь"
  ];

  return monthNames[this.getMonth()];
};
