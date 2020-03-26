"use strict";

import { db, openDb, outlayObjectStoreName, _deleteDb } from "./db.js";

window.onload = openDb(displayData);

function displayData() {
  document.getElementById("dbName").innerHTML = db.name;
}

window.deleteDb = _deleteDb;
