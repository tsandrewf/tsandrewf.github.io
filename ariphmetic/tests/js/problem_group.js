"use strict";

window.ProblemSelect = function (url) {
  console.log("this", this);
  console.log("self", self);
  top.Navigate(url);
};

window.onload = function () {
  const locationPathnameSplit = self.location.pathname.split("/");
  const navbarButtonActive = parent.document.getElementById(
    locationPathnameSplit[locationPathnameSplit.length - 2]
  );

  for (let navbarButton of parent.document.getElementsByClassName("navbar")[0]
    .childNodes) {
    if (navbarButton.isEqualNode(navbarButtonActive)) {
      navbarButton.className = "navbar-button-active";
    } else {
      navbarButton.className = "navbar-button-passive";
    }
  }

  //  CreateSVG();
};

window.Test = function (elem, testNum) {
  top.Navigate(
    "../test" +
      testNum +
      ".html?title=" +
      elem.innerText +
      "&script=" +
      elem.getAttribute("script")
  );
};

// https://stackoverflow.com/questions/3492322/javascript-createelementns-and-svg
/*function CreateSVG() {
  const radiusPercent = 45;
  const clockMarkerWidtPercent = 8;

  var xmlns = "http://www.w3.org/2000/svg";
  //var boxWidth = 300;
  //var boxHeight = 300;
  var boxWidth = "5em";
  var boxHeight = "5em";

  var svgElem = document.createElementNS(xmlns, "svg");
  //svgElem.setAttributeNS(null, "viewBox", "0 0 " + boxWidth + " " + boxHeight);
  svgElem.setAttributeNS(null, "width", boxWidth);
  svgElem.setAttributeNS(null, "height", boxHeight);
  svgElem.style.display = "block";

  const svgBorder = document.createElementNS(xmlns, "circle");
  svgBorder.setAttributeNS(null, "cx", "50%");
  svgBorder.setAttributeNS(null, "cy", "50%");
  svgBorder.setAttributeNS(null, "r", radiusPercent + "%");
  svgBorder.setAttributeNS(null, "stroke", "black");
  svgBorder.setAttributeNS(null, "fill", "transparent");
  svgBorder.setAttributeNS(null, "stroke-width", "2");
  svgElem.appendChild(svgBorder);

  const svgCenter = document.createElementNS(xmlns, "circle");
  svgCenter.setAttributeNS(null, "cx", "50%");
  svgCenter.setAttributeNS(null, "cy", "50%");
  svgCenter.setAttributeNS(null, "r", "5%");
  svgCenter.setAttributeNS(null, "fill", "black");
  svgElem.appendChild(svgCenter);

  for (let i = 0; i < 12; i++) {
    const angle = 30 * i * (Math.PI / 180);
    const svgLine = document.createElementNS(xmlns, "line");
    svgLine.setAttributeNS(
      null,
      "x1",
      50 + (radiusPercent - clockMarkerWidtPercent) * Math.sin(angle) + "%"
    );
    svgLine.setAttributeNS(
      null,
      "y1",
      50 -
        (radiusPercent - clockMarkerWidtPercent) +
        (radiusPercent - clockMarkerWidtPercent) * (1 - Math.cos(angle)) +
        "%"
    );
    svgLine.setAttributeNS(
      null,
      "x2",
      50 + radiusPercent * Math.sin(angle) + "%"
    );
    svgLine.setAttributeNS(
      null,
      "y2",
      50 - radiusPercent + radiusPercent * (1 - Math.cos(angle)) + "%"
    );
    svgLine.setAttributeNS(null, "stroke", "black");
    svgLine.setAttributeNS(null, "fill", "transparent");
    svgLine.setAttributeNS(null, "stroke-width", "2");
    svgElem.appendChild(svgLine);
  }

  // Beg Clock Arrow
  {
    const clock = 5;
    const angle = 30 * clock * (Math.PI / 180);
    const clockArrowLengthPercent = 25;
    const svgLine = document.createElementNS(xmlns, "line");
    svgLine.setAttributeNS(null, "x1", "50%");
    svgLine.setAttributeNS(null, "y1", "50%");
    svgLine.setAttributeNS(
      null,
      "x2",
      50 + clockArrowLengthPercent * Math.sin(angle) + "%"
    );
    svgLine.setAttributeNS(
      null,
      "y2",
      50 -
        clockArrowLengthPercent +
        clockArrowLengthPercent * (1 - Math.cos(angle)) +
        "%"
    );
    svgLine.setAttributeNS(null, "stroke", "black");
    svgLine.setAttributeNS(null, "fill", "transparent");
    svgLine.setAttributeNS(null, "stroke-width", "4");
    svgLine.setAttributeNS(null, "stroke-linecap", "round");
    svgElem.appendChild(svgLine);
  }
  // End Clock Arrow

  // Beg Minute Arrow
  {
    const minute = 20;
    const angle = 6 * minute * (Math.PI / 180);
    const clockArrowLengthPercent = 35;
    const svgLine = document.createElementNS(xmlns, "line");
    svgLine.setAttributeNS(null, "x1", "50%");
    svgLine.setAttributeNS(null, "y1", "50%");
    svgLine.setAttributeNS(
      null,
      "x2",
      50 + clockArrowLengthPercent * Math.sin(angle) + "%"
    );
    svgLine.setAttributeNS(
      null,
      "y2",
      50 -
        clockArrowLengthPercent +
        clockArrowLengthPercent * (1 - Math.cos(angle)) +
        "%"
    );
    svgLine.setAttributeNS(null, "stroke", "black");
    svgLine.setAttributeNS(null, "fill", "transparent");
    svgLine.setAttributeNS(null, "stroke-width", "2");
    svgLine.setAttributeNS(null, "stroke-linecap", "round");
    svgElem.appendChild(svgLine);
  }
  // End Minute Arrow

  document.getElementById("svgContainer").appendChild(svgElem);
}*/
