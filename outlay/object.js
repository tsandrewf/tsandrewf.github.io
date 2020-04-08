"use strict";

Object.prototype._diffStructure = function (standardObjectStructure) {
  const thisObjectEntries = Object.entries(this);
  const standardObjectEntries = Object.entries(standardObjectStructure);

  for (let standardObjectEntry of standardObjectEntries) {
    if (
      !thisObjectEntries
        .flatMap((thisObjectEntry) => thisObjectEntry[0])
        .includes(standardObjectEntry[0])
    ) {
      return (
        'ОТСУТСТВУЕТ поле "' +
        standardObjectEntry[0] +
        '" в объекте ' +
        JSON.stringify(this)
      );
    }

    if (
      standardObjectEntry[1].type &&
      !(
        // https://stackoverflow.com/questions/643782/how-to-check-whether-an-object-is-a-date
        (
          ("date" === standardObjectEntry[1].type &&
            Object.prototype.toString.call(this[standardObjectEntry[0]]) ===
              "[object Date]") ||
          ("array" === standardObjectEntry[1].type &&
            Object.prototype.toString.call(this[standardObjectEntry[0]]) ===
              "[object Array]") ||
          standardObjectEntry[1].type === typeof this[standardObjectEntry[0]] ||
          (!this[standardObjectEntry[0]] && standardObjectEntry[1].nullable)
        )
      )
    ) {
      return (
        "В объекте " +
        JSON.stringify(this) +
        ' тип "' +
        typeof this[standardObjectEntry[0]] +
        '" поля "' +
        standardObjectEntry[0] +
        '" НЕ соответствует заданному "' +
        standardObjectEntry[1].type +
        '"'
      );
    }

    if (
      "array" === standardObjectEntry[1].type &&
      standardObjectEntry[1].array
    ) {
      for (let val of this[standardObjectEntry[0]]) {
        if (
          !(
            typeof val === standardObjectEntry[1].array.type ||
            (standardObjectEntry[1].array.nullable && !val)
          )
        ) {
          return (
            "В объекте " +
            JSON.stringify(this) +
            ' тип "' +
            typeof val +
            '" элемента "' +
            val +
            '" поля "' +
            standardrObjectEntry[0] +
            '" НЕ соответствует заданному "' +
            standardObjectEntry[1].array.type +
            '"'
          );
        }
      }
    }
  }

  for (let thisObjectEntry of thisObjectEntries) {
    if (
      !standardObjectEntries
        .flatMap((standardObjectEntry) => standardObjectEntry[0])
        .includes(thisObjectEntry[0])
    ) {
      return (
        'НЕдопустимое поле "' +
        thisObjectEntry[0] +
        '" объекта ' +
        JSON.stringify(this)
      );
    }
  }

  return null;
};
