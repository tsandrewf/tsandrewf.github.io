"use strict";

import { openDb } from "./db.js";
import { getQueryVar } from "./url.js";
import { Category } from "./category.js";

let id;
let parentId;

window.onload = openDb(displayData);

function displayData() {
  NavbarBottom.show([
    { text: "Чеки", href: "outlay.html" },
    { text: "Категории", href: "outlayCategory.html" },
    { text: "Итоги", href: "outlaySummary.html" }
  ]);

  id = getQueryVar("id");
  parentId = getQueryVar("parentId");

  if (!id && !parentId) {
    alert('НЕ задан ни один из параметров "id" и "parentId"');
  } else if (id && parentId) {
    alert('ОДНОВРЕМЕННО заданы параметры "id" и "parentId"');
  } else if (id) {
    displayDataCategoryEdit();
  } else if (parentId) {
    displayDataCategoryNew();
  }

  id = Number(id);
  parentId = Number(parentId);
}

async function categoryTree(category) {
  let upperCategoryArray = [];
  while (category) {
    upperCategoryArray.push(category);
    category = await Category.get(category.parentId);
  }

  let parentUl = document.getElementsByTagName("UL")[0];
  for (let category of upperCategoryArray.reverse()) {
    let ul = document.createElement("UL");
    parentUl.appendChild(ul);
    let li = document.createElement("LI");
    ul.appendChild(li);
    li.innerHTML = category.name;
    parentUl = ul;
  }

  let ul = document.createElement("UL");
  parentUl.appendChild(ul);
  let li = document.createElement("LI");
  ul.appendChild(li);
  let input = document.createElement("INPUT");
  input.id = "categoryName";
  li.appendChild(input);
  input.focus();
}

async function displayDataCategoryEdit() {
  window.save = saveEdit;
  document.getElementById("colTitle").innerHTML = "Изменение категории затрат";

  id = Number(id);
  if (0 === id) {
    alert("НЕЛЬЗЯ изменять название корневой категории затрат");
    return;
  }

  const category = await Category.get(id);
  await categoryTree(category);
  document.getElementById("categoryName").value = category.name;
}

async function displayDataCategoryNew() {
  parentId = Number(parentId);
  window.save = saveNew;
  document.getElementById("colTitle").innerHTML = "Новая категория затрат";
  categoryTree(await Category.get(parentId));
}

async function saveNew() {
  try {
    let categoryName = document.getElementById("categoryName").value.trim();
    if (!categoryName) {
      alert("НЕ задано название категории");
      return;
    }

    await Category.set({
      name: categoryName,
      parentId: parentId,
      expanded: false
    });

    if (0 !== parentId) {
      await Category.setExpanded(parentId, true);
    }

    history.go(-1);
  } catch (error) {
    alert(error);
  }
}

async function saveEdit() {
  let categoryName = document.getElementById("categoryName").value.trim();
  if (!categoryName) {
    alert("НЕ задано название категории");
    return;
  }

  let category = await Category.get(id);
  if (categoryName === category.name) {
    alert("Название категории затрат НЕ изменено");
    return;
  }

  category.name = categoryName;
  await Category.set(category);
  history.go(-1);
}
