class NavbarTop {
  static show(options) {
    let navbarTop = document.getElementsByClassName("navbar-top").item(0);

    while (navbarTop.firstChild) {
      navbarTop.removeChild(navbarTop.firstChild);
    }

    if (options.menu) {
      let divMenu = document.createElement("DIV");
      navbarTop.appendChild(divMenu);
      divMenu.className = "dropdown";

      let buttonMenu = document.createElement("BUTTON");
      divMenu.appendChild(buttonMenu);
      buttonMenu.className = "dropbtn";
      buttonMenu.innerHTML = options.menu.buttonHTML;

      let divDropdownContent = document.createElement("DIV");
      divMenu.appendChild(divDropdownContent);
      divDropdownContent.className = "dropdown-content";
      for (let menuContentItem of options.menu.content) {
        let aMenuContentItem = document.createElement("A");
        divDropdownContent.appendChild(aMenuContentItem);
        aMenuContentItem.innerHTML = menuContentItem.innerHTML;
        aMenuContentItem.href = menuContentItem.href;
      }

      let divTitle = document.createElement("DIV");
      navbarTop.appendChild(divTitle);
      divTitle.innerHTML = options.titleHTML;

      let divButtons = document.createElement("DIV");
      navbarTop.appendChild(divButtons);
      divButtons.className = "buttons";
      for (let button of options.buttons) {
        let divButton = document.createElement("DIV");
        divButtons.appendChild(divButton);
        divButton.className = "button";
        divButton.onclick = button.onclick;

        let divButtonInnerHTML = document.createElement("DIV");
        divButton.appendChild(divButtonInnerHTML);
        divButtonInnerHTML.innerHTML = button.innerHTML;
      }
    }
  }
}
