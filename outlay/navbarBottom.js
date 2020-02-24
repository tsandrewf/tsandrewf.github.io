class NavbarBottom {
  static show(options) {
    let navbarBottom = document.getElementsByClassName("navbar-bottom").item(0);
    for (let option of options) {
      let div = document.createElement("DIV");
      navbarBottom.appendChild(div);
      if (option.href) {
        let a = document.createElement("A");
        div.appendChild(a);
        a.innerHTML = option.text;
        a.href = option.href;
      } else if (option.text) {
        div.innerHTML = option.text;
      }
    }
  }
}
