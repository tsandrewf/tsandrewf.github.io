"use strict";

// https://askvoprosy.com/voprosy/searching-for-compound-indexes-in-indexeddb

export let db;

export const settingObjectStoreName = "setting";
export const outlayObjectStoreName = "outlay";
export const outlayCategoryObjectStoreName = "outlayCategory";
export const outlayCategorySelectedKeyName = "outlayCategorySelected";
export const outlayDateSelectedKeyName = "outlayDateSelected";
export const outlaySummaryPeriodKeyName = "outlaySummaryPeriod";
export const windowOnloadKeyName = "windowOnload";
export const retValKeyName = "retVal";
export const categoryHtmlKeyName = "categoryHtml";
export const outlayEntriesDateMinCalcKeyName = "outlayEntriesDateMinCalc";

export let getCategoryChilds;

export function openDb(displayData) {
  const DBOpenRequest = window.indexedDB.open("mymoney", 1);

  DBOpenRequest.onsuccess = function(event) {
    // store the result of opening the database in the db variable. This is used a lot below
    db = DBOpenRequest.result;

    const index = db
      .transaction(outlayCategoryObjectStoreName)
      .objectStore(outlayCategoryObjectStoreName)
      .index("parentCategoryId_idx");

    if ("object" === typeof index.keyPath) {
      getCategoryChilds = async function(categoryId, transaction) {
        const categoryChilds = await new Promise(function(resolve, reject) {
          const request = transaction
            .objectStore(outlayCategoryObjectStoreName)
            .index("parentCategoryId_idx")
            .getAll(
              IDBKeyRange.bound([categoryId], [categoryId + 1], false, true)
            );

          request.onsuccess = function() {
            resolve(request.result);
          };

          request.onerror = function() {
            reject(request.error);
          };
        });

        return categoryChilds;
      };
    } else {
      getCategoryChilds = async function(categoryId, transaction) {
        const categoryChilds = await new Promise(function(resolve, reject) {
          const request = transaction
            .objectStore(outlayCategoryObjectStoreName)
            .index("parentCategoryId_idx")
            .getAll(IDBKeyRange.only(categoryId));

          request.onsuccess = function() {
            resolve(
              request.result.sort(function(x, y) {
                return x.name > y.name
                  ? 1
                  : x.name < y.name
                  ? -1
                  : x.id > y.id
                  ? 1
                  : -1;
              })
            );
          };

          request.onerror = function() {
            reject(request.error);
          };
        });

        return categoryChilds;
      };
    }

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

    /*if (osOptions.indexes) {
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
    }*/
    if (osOptions.indexes) {
      for (let index of osOptions.indexes) {
        console.log("index.name", index.name);
        console.log("index.keyPath", index.keyPath);
        console.log("typeof index.keyPath", typeof index.keyPath);
        if ("string" === typeof index.keyPath || objectStore.getAll) {
          objectStore.createIndex(
            index.name,
            index.keyPath,
            undefined === index.options
              ? {
                  unique: false
                }
              : index.options
          );
        } else {
          console.log("Составные индексы НЕ поддерживаются");
          objectStore.createIndex(
            index.name,
            index.keyPath[0],
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
