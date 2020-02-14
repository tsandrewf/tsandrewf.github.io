/*export class StandbyIndicator {
  standbyIndicator = null;

  static show() {
    if (this.standbyIndicator) return;

    this.standbyIndicator = document.createElement("DIV");
    document.body.appendChild(this.standbyIndicator);
    this.standbyIndicator.id = "standbyIndicator";
  }

  static hide() {
    if (!this.standbyIndicator) return;

    document.body.removeChild(this.standbyIndicator);
    this.standbyIndicator = null;
  }
}*/
export class StandbyIndicator {
  standbyIndicator = null;

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
}
