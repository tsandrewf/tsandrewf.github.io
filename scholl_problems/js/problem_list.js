"use strict";

window.ProblemSelect = function (problemNum) {
  const pathnameSplit = location.pathname.split("/");
  const url = encodeURI(
    "../../problem_with_decision.html?problem=" +
      problemNum +
      "&problemCount=" +
      document.querySelectorAll("main > ul > li").length +
      "&baseUrl=" +
      pathnameSplit[pathnameSplit.length - 3] +
      "/" +
      pathnameSplit[pathnameSplit.length - 2] +
      "&title=" +
      document.title
  );

  //location.href = url;
  top.Navigate(url);
};
