"use strict";

// https://stackoverflow.com/questions/39837678/why-no-array-prototype-flatmap-in-javascript
const concat = (x, y) => x.concat(y);

const flatMap = (f, xs) => xs.map(f).reduce(concat, []);

// Edge НЕ поддерживет функцию flatMap, поэтому для таких браузеров
// добавляем эту функцию вручную
Array.prototype.flatMap =
  Array.prototype.flatMap ||
  function(f) {
    return flatMap(f, this);
  };
