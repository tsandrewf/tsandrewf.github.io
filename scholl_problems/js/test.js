"use strict";

export function RefreshLogHeight() {
  // Beg Подгоняем высоту елемента "log" под высоту окна
  const elemLog = document.getElementById("log");
  elemLog.style.height =
    (window.innerHeight - elemLog.getBoundingClientRect().top).toString() +
    "px";
  // End Подгоняем высоту елемента "log" под высоту окна
}

export function AddAndSubGetTest(maxNum) {
  const operand1 = 1 + Math.trunc(maxNum * Math.random());
  const operation = 0.5 < Math.random() ? "+" : "-";
  const operand2 =
    "+" == operation
      ? Math.trunc((1 + maxNum - operand1) * Math.random())
      : Math.trunc(1 + operand1 * Math.random());

  return operand1 + operation + operand2;
}
