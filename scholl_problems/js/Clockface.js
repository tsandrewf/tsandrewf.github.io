"use strict";

// https://stackoverflow.com/questions/3492322/javascript-createelementns-and-svg
export class Clockface {
  elemClockface;

  constructor(params) {
    const radiusPercent = 45;
    const clockMarkerWidtPercent = 8;

    var xmlns = "http://www.w3.org/2000/svg";
    var boxWidth = "5em";
    var boxHeight = "5em";

    var svgElem = document.createElementNS(xmlns, "svg");
    svgElem.setAttributeNS(null, "width", boxWidth);
    svgElem.setAttributeNS(null, "height", boxHeight);
    svgElem.style.display = "block";

    const svgBorder = document.createElementNS(xmlns, "circle");
    svgBorder.setAttributeNS(null, "cx", "50%");
    svgBorder.setAttributeNS(null, "cy", "50%");
    svgBorder.setAttributeNS(null, "r", radiusPercent + "%");
    //svgBorder.setAttributeNS(null, "stroke", params.color);
    svgBorder.setAttributeNS(null, "fill", "transparent");
    svgBorder.setAttributeNS(null, "stroke-width", "2");
    svgElem.appendChild(svgBorder);

    const svgCenter = document.createElementNS(xmlns, "circle");
    svgCenter.setAttributeNS(null, "cx", "50%");
    svgCenter.setAttributeNS(null, "cy", "50%");
    svgCenter.setAttributeNS(null, "r", "5%");
    //svgCenter.setAttributeNS(null, "fill", params.color);
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
      //svgLine.setAttributeNS(null, "stroke", params.color);
      svgLine.setAttributeNS(null, "fill", "transparent");
      svgLine.setAttributeNS(null, "stroke-width", "2");
      svgElem.appendChild(svgLine);
    }

    // Beg Clock Arrow
    if (null != params.clocks) {
      //const angle = 30 * params.clocks * (Math.PI / 180);
      const angle =
        (30 * params.clocks + 0.5 * params.minutes) * (Math.PI / 180);
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
      //svgLine.setAttributeNS(null, "stroke", params.color);
      svgLine.setAttributeNS(null, "fill", "transparent");
      svgLine.setAttributeNS(null, "stroke-width", "4");
      svgLine.setAttributeNS(null, "stroke-linecap", "round");
      svgLine.setAttributeNS(null, "id", "clock");
      svgElem.setAttributeNS(null, "clocks", params.clocks);
      svgElem.appendChild(svgLine);
    }
    // End Clock Arrow

    // Beg Minute Arrow
    if (null != params.minutes) {
      const angle = 6 * params.minutes * (Math.PI / 180);
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
      //svgLine.setAttributeNS(null, "stroke", params.color);
      svgLine.setAttributeNS(null, "fill", "transparent");
      svgLine.setAttributeNS(null, "stroke-width", "2");
      svgLine.setAttributeNS(null, "stroke-linecap", "round");
      svgLine.setAttributeNS(null, "id", "minute");
      svgElem.setAttributeNS(null, "minutes", params.minutes);
      svgElem.appendChild(svgLine);
    }
    // End Minute Arrow

    this.elemClockface = svgElem.cloneNode(true);
  }
}
