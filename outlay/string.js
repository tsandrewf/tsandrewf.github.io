"use strict";

// https://stackoverflow.com/questions/2332811/capitalize-words-in-string
String.prototype._capitalizeWords = function () {
  return this.replace(/\b\w/g, (l) => l.toUpperCase());
};

// https://learn.javascript.ru/task/ucfirst
String.prototype._capitalize = function () {
  if (!this) return this;

  return this[0].toUpperCase() + this.slice(1);
};
