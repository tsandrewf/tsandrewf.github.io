export class StandbyIndicator {
  static standbyIndicator = null;

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
}
