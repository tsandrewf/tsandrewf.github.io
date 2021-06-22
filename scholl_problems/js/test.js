"use strict";

import { Clockface } from "./Clockface.js";

export function RefreshLogHeight() {
  // Beg Подгоняем высоту елемента "log" под высоту окна
  const elemLog = document.getElementById("log");
  elemLog.style.height =
    (window.innerHeight - elemLog.getBoundingClientRect().top).toString() +
    "px";
  // End Подгоняем высоту елемента "log" под высоту окна
}

export function IsCorrectAgjacentNumbers(testSrc) {
  const match = /(\d{1,2}),(\d{1,2}),(\d{1,2})/i.exec(
    testSrc.innerText.replace(/\s/g, "")
  );
  return (
    match &&
    Number(match[1]) + 1 == Number(match[2]) &&
    Number(match[2]) + 1 == Number(match[3])
  );
}

export function IsCorrectAnswerPredicate(testSrc) {
  return eval(
    testSrc.innerText
      .replace(/\u00D7/g, "*") // &times;
      .replace(/:/g, "/")
      .replace(/=/g, "==")
      .replace(/0(\d)/g, "$1") // ToDo! Only for numbers under 100
  );
}

export function IsCorrectAnswerClockface(elemTestSrc) {
  const match = new RegExp(/(\d{0,2})час(\d{0,2})мин/i).exec(
    elemTestSrc.innerText.replace(/\s/g, "")
  );
  const timeDigit = {
    clocks: Number(match[1]),
    minutes: Number(match[2]),
  };

  const timeClockface = new Clockface(
    elemTestSrc.getElementsByTagName("svg")[0]
  ).time;

  return (
    timeDigit.clocks == timeClockface.clocks &&
    timeDigit.minutes == timeClockface.minutes
  );
}

function GetDigitArray(rowCount, colCount) {
  let digitArray = new Array();
  if (colCount) {
    for (let op1 = 1; op1 <= rowCount; op1++) {
      for (let op2 = 1; op2 <= colCount; op2++) {
        digitArray.push({ op1: op1, op2: op2 });
      }
    }
  } else {
    for (let op1 = 1; op1 <= rowCount; op1++) {
      digitArray.push(op1);
    }
  }
  return digitArray;
}

// Beg TestAddOrSub
let testArrays = {};

export function GetTestClockfaceNumber() {
  const arrayTitle = "Clockface";

  if (!testArrays[arrayTitle]) {
    testArrays[arrayTitle] = new Array();
  }

  let testArray = testArrays[arrayTitle];

  if (0 == testArray.length) {
    testArray = testArray.concat(GetDigitArray(144));
  }

  const index =
    1 == testArray.length ? 0 : Math.floor(Math.random() * testArray.length);
  const test = testArray[index] - 1;
  testArray.splice(index, 1);

  return test;
}

export function GetTestAdjacentNumbers(maxNumber) {
  const arrayTitle = "AdjacentNumbers" + maxNumber;

  if (!testArrays[arrayTitle]) {
    testArrays[arrayTitle] = new Array();
  }

  let testArray = testArrays[arrayTitle];

  if (0 == testArray.length) {
    testArray = testArray.concat(
      GetDigitArray(maxNumber).filter(
        (element) => element > 1 && element < maxNumber
      )
    );
  }

  const index =
    1 == testArray.length ? 0 : Math.floor(Math.random() * testArray.length);
  const test = testArray[index];
  testArray.splice(index, 1);

  return "??," + test + ",??";
}

export function GetTestAddOrSub(maxNumber) {
  const arrayTitle = "AddOrSub" + maxNumber + "x" + maxNumber;

  if (!testArrays[arrayTitle]) {
    testArrays[arrayTitle] = new Array();
  }

  let testAddOrSubArray = testArrays[arrayTitle];

  if (0 == testAddOrSubArray.length) {
    testAddOrSubArray = testAddOrSubArray
      .concat(
        GetDigitArray(maxNumber, maxNumber)
          .filter((element) => element.op1 + element.op2 < maxNumber + 1)
          .map((element) => element.op1 + "+" + element.op2)
      )
      .concat(
        GetDigitArray(maxNumber, maxNumber)
          .filter((element) => element.op1 - element.op2 > 0)
          .map((element) => element.op1 + "-" + element.op2)
      );
  }

  const index =
    1 == testAddOrSubArray.length
      ? 0
      : Math.floor(Math.random() * testAddOrSubArray.length);
  const test = testAddOrSubArray[index];
  testAddOrSubArray.splice(index, 1);

  return test;
}
// End TestAddOrSub

let operandArray = new Array();

export function GetOperands9x9() {
  if (0 == operandArray.length) {
    operandArray = GetDigitArray(9, 9);
  }

  let operands;
  if (1 == operandArray.length) {
    operands = operandArray[0];
  } else {
    const index = Math.floor(Math.random() * operandArray.length);
    operands = operandArray[index];
    operandArray.splice(index, 1);
  }

  return operands;
}

/*export function GetExprAddOrSub(maxNum) {
  const operand1 = 1 + Math.trunc((maxNum - 1) * Math.random());
  //const operation = 0.5 < Math.random() ? "+" : "-";
  const operation =
    maxNum - 1 == operand1 ? "-" : 0.5 < Math.random() ? "+" : "-";
  const operand2 =
    "+" == operation
      ? Math.trunc(1 + (maxNum - operand1 - 1) * Math.random())
      : Math.trunc(1 + operand1 * Math.random());

  return operand1 + operation + operand2;
}*/

/*export function GetTestAddAndSub(maxNum) {
  return GetExprAddOrSub(maxNum) + "=??";
}*/

export function GetTestInsertNumber(maxNum) {
  const operation = 0.5 < Math.random() ? "+" : "-";
  const operand1 = Math.trunc(maxNum * Math.random());
  if ("+" == operation) {
    const operand2 = operand1 + Math.trunc((maxNum - operand1) * Math.random());
    return (
      (0.5 < Math.random()
        ? "??" + operation + operand1
        : operand1 + operation + "??") +
      "=" +
      operand2
    );
  } else {
    if (0.5 < Math.random()) {
      return (
        "??" +
        operation +
        operand1 +
        "=" +
        Math.trunc((maxNum - operand1) * Math.random())
      );
    } else {
      return (
        operand1 + operation + "??=" + Math.trunc(operand1 * Math.random())
      );
    }
  }
}
