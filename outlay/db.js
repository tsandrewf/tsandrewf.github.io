// https://askvoprosy.com/voprosy/searching-for-compound-indexes-in-indexeddb

export let db;
export let settingObjectStoreName = "setting";
export let outlayObjectStoreName = "outlay";
export let outlayCategoryObjectStoreName = "outlayCategory";
export let outlayCategorySelectedKeyName = "outlayCategorySelected";
export let outlayDateSelectedKeyName = "outlayDateSelected";
export let outlaySummaryPeriodKeyName = "outlaySummaryPeriod";

export function openDb(displayData) {
  const DBOpenRequest = window.indexedDB.open("mymoney", 1);

  DBOpenRequest.onsuccess = function(event) {
    // store the result of opening the database in the db variable. This is used a lot below
    db = DBOpenRequest.result;

    /*console.log('IndexedDb "' + db.name + '" was opened');
    console.log(db.objectStoreNames);
    for (let objectStoreName of db.objectStoreNames) {
      console.log('ObjectStore "' + objectStoreName + '"');
      console.log(db.transaction(objectStoreName).objectStore(objectStoreName));
    }*/

    if (displayData) displayData();
  };

  DBOpenRequest.onupgradeneeded = function(event) {
    db = DBOpenRequest.result;
    console.log(
      'IndexedDb "' +
        db.name +
        '" version "' +
        event.oldVersion +
        '" needs to be upgraded to version "' +
        db.version +
        '"'
    );
    switch (
      event.oldVersion // существующая (старая) версия базы данных
    ) {
      case 0: // версия 0 означает, что на клиенте нет базы данных выполнить инициализацию
        console.log(
          'IndexedDb "' + db.name + '" does not exist. Trying to create'
        );
        _createObjectStore([
          {
            name: settingObjectStoreName,
            keyOptions: {
              keyPath: "id",
              autoIncrement: false
            }
          },
          {
            name: outlayObjectStoreName,
            indexes: [
              {
                name: "date_idx",
                keyPath: "date"
              },
              {
                name: "categoryId_idx",
                keyPath: "categories",
                options: { unique: false, multiEntry: true }
              }
            ]
          },
          {
            name: outlayCategoryObjectStoreName,
            indexes: [
              {
                name: "parentCategoryId_idx",
                //keyPath: "parentId"
                // https://askvoprosy.com/voprosy/searching-for-compound-indexes-in-indexeddb
                keyPath: ["parentId", "name"]
              }
            ]
          }
        ]);
        console.log('IndexedDb "' + db.name + '" was created');
    }
  };
}

function _createObjectStore(osOptionsArray) {
  for (let osOptions of osOptionsArray) {
    console.log(
      'Trying to create ObjectStore "' +
        osOptions.name +
        '" in IndexedDb "' +
        db.name +
        '"'
    );
    const objectStore = db.createObjectStore(
      osOptions.name,
      undefined === osOptions.keyOptions
        ? {
            keyPath: "id",
            autoIncrement: true
          }
        : osOptions.keyOptions
    );
    console.log(
      'ObjectStore "' +
        osOptions.name +
        '" was created in IndexedDb "' +
        db.name +
        '"'
    );
    /*if (osOptions.indexOptions) {
      objectStore.createIndex(
        osOptions.indexOptions.name,
        osOptions.indexOptions.keyPath,
        undefined === osOptions.indexOptions.options
          ? {
              unique: false
            }
          : osOptions.indexOptions.options
      );
    }*/
    if (osOptions.indexes) {
      for (let index of osOptions.indexes) {
        objectStore.createIndex(
          index.name,
          index.keyPath,
          undefined === index.options
            ? {
                unique: false
              }
            : index.options
        );
      }
    }
  }
}

export function _deleteDb() {
  const dbName = db.name;
  console.log('Trying to close IndexedDb "' + dbName + '"');
  db.close();
  console.log('IndexedDb "' + dbName + '" was closed');

  console.log('Trying to delete IndexedDb "' + dbName + '"');
  let deleteRequest = indexedDB.deleteDatabase(dbName);
  deleteRequest.onsuccess = function() {
    console.log('IndexedDb "' + dbName + '" was deleted');
  };
  deleteRequest.onerror = function() {
    console.log('Error on deleting IndexedDb "' + dbName + '"');
  };
}
