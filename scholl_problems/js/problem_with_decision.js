"use strict";

import { getQueryVar } from "./getQueryVar.js";

let problemCount;

window.onload = function () {
  problemCount = Number(getQueryVar("problemCount"));
  const problemNum = Number(getQueryVar("problem"));

  RefreshActionBar(problemNum);

  document.getElementById("title").innerHTML = getQueryVar("title");

  document.getElementById("problem").src =
    getQueryVar("baseUrl") + "/problem" + problemNum + ".html";
};

function RefreshActionBar(problemNum) {
  const actionButtonArray = document.getElementsByClassName("action-button");

  if (1 == problemNum) {
    actionButtonArray[0].classList.remove("action-button-active");
    actionButtonArray[1].classList.remove("action-button-active");
    actionButtonArray[2].classList.add("action-button-active");
    actionButtonArray[3].classList.add("action-button-active");
  } else if (problemCount == problemNum) {
    actionButtonArray[0].classList.add("action-button-active");
    actionButtonArray[1].classList.add("action-button-active");
    actionButtonArray[2].classList.remove("action-button-active");
    actionButtonArray[3].classList.remove("action-button-active");
  } else {
    actionButtonArray[0].classList.add("action-button-active");
    actionButtonArray[1].classList.add("action-button-active");
    actionButtonArray[2].classList.add("action-button-active");
    actionButtonArray[3].classList.add("action-button-active");
  }
}

window.ProblemSelect = function (problem) {
  const elemProblem = document.getElementById("problem");
  const problemSrcSplit = elemProblem.contentWindow.location.href.split("/");
  const pageSplit = problemSrcSplit[problemSrcSplit.length - 1].split(".");

  let problemNum = Number(pageSplit[0].replace(/problem/, ""));

  if (
    ("last" == problem && problemNum == problemCount) ||
    ("first" == problem && 1 == problemNum)
  )
    return;

  if (problem.substring) {
    if ("next" == problem) problemNum++;
    else if ("prev" == problem) problemNum--;
    else if ("first" == problem) problemNum = 1;
    else if ("last" == problem) problemNum = problemCount;
  } else if (problem.toFixed) {
    problemNum = Number(problem);
  }

  if (1 > problemNum || problemCount < problemNum) return;

  RefreshActionBar(problemNum);

  const url =
    problemSrcSplit[problemSrcSplit.length - 3] +
    "/" +
    problemSrcSplit[problemSrcSplit.length - 2] +
    "/" +
    "problem" +
    problemNum +
    "." +
    pageSplit[1];

  elemProblem.contentWindow.location.replace(url);
};
