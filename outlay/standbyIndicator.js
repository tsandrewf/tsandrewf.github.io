export class StandbyIndicator {
  static show() {
    let standbyIndicator = document.getElementById("standbyIndicator");
    if (standbyIndicator) return;

    standbyIndicator = document.createElement("DIV");
    document.body.appendChild(standbyIndicator);
    standbyIndicator.id = "standbyIndicator";
  }

  static hide() {
    let standbyIndicator = document.getElementById("standbyIndicator");
    if (!standbyIndicator) return;

    document.body.removeChild(standbyIndicator);
    standbyIndicator = null;
  }

  static isShowing() {
    return document.getElementById("standbyIndicator") ? true : false;
  }
}
