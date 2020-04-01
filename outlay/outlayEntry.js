"use strict";

import { db, outlayObjectStoreName } from "./db.js";
import { Category } from "./category.js";

export class OutlayEntry {
  constructor(entry) {
    this.entry = entry;
  }

  static async getCategoryIdTop(outlayEntry, transaction) {
    if (1 === outlayEntry.categories.length) {
      return outlayEntry.categories[0];
    }

    let ancestorsAll = null;
    for (let i = 0; i < outlayEntry.categories.length; i++) {
      const categoryId = outlayEntry.categories[i];
      if (outlayEntry.sums[i]) {
        if (!categoryId) {
          ancestorsAll = null;
          break;
        }

        let ancestors = await Category.getAncestors(categoryId, transaction);
        if (!ancestorsAll) {
          ancestorsAll = ancestors.slice();
        } else {
          let length =
            ancestorsAll.length > ancestors.length
              ? ancestorsAll.length
              : ancestors.length;
          let i;
          for (i = 1; i <= length; i++) {
            if (
              ancestorsAll[ancestorsAll.length - i] !==
              ancestors[ancestors.length - i]
            ) {
              ancestorsAll.splice(0, ancestorsAll.length - i + 1);
              break;
            }
          }

          if (0 === ancestorsAll.length) break;
        }
      }
    }

    return !ancestorsAll || 0 === ancestorsAll.length ? null : ancestorsAll[0];
  }

  static async clear(transaction) {
    try {
      if (!transaction) transaction = db.transaction(outlayObjectStoreName);

      const category = await new Promise(function(resolve, reject) {
        let request = transaction.objectStore(outlayObjectStoreName).clear();

        request.onsuccess = function() {
          resolve(request.result);
        };

        request.onerror = function() {
          reject(request.error);
        };
      });

      return category;
    } catch (error) {
      transaction.abort();
      throw new Error(error);
    }
  }

  static async delete(entryId, transaction) {
    try {
      if (!entryId) return null;

      if (!transaction)
        transaction = db.transaction(outlayObjectStoreName, "readwrite");

      await new Promise(function(resolve, reject) {
        let request = transaction
          .objectStore(outlayObjectStoreName)
          .delete(entryId);

        request.onsuccess = function() {
          resolve();
        };

        request.onerror = function() {
          reject(request.error);
        };
      });
    } catch (error) {
      transaction.abort();
      throw new Error(error);
    }
  }

  static async getAll(transaction) {
    try {
      if (!transaction) transaction = db.transaction(outlayObjectStoreName);

      const category = await new Promise(function(resolve, reject) {
        let request = transaction.objectStore(outlayObjectStoreName).getAll();

        request.onsuccess = function() {
          resolve(request.result);
        };

        request.onerror = function() {
          reject(request.error);
        };
      });

      return category;
    } catch (error) {
      transaction.abort();
      throw new Error(error);
    }
  }

  static async get(entryId, transaction) {
    try {
      if (!entryId) return null;

      if (!transaction) transaction = db.transaction(outlayObjectStoreName);

      const entry = await new Promise(function(resolve, reject) {
        let request = transaction
          .objectStore(outlayObjectStoreName)
          .get(entryId);

        request.onsuccess = function() {
          resolve(request.result);
        };

        request.onerror = function() {
          reject(request.error);
        };
      });

      return entry;
    } catch (error) {
      transaction.abort();
      throw new Error(error);
    }
  }

  static async getEntryOlder(date, transaction) {
    try {
      if (!transaction) transaction = db.transaction(outlayObjectStoreName);

      const entry = await new Promise(function(resolve, reject) {
        let request = transaction
          .objectStore(outlayObjectStoreName)
          .index("date_idx")
          .openCursor(IDBKeyRange.upperBound(date, true), "prev");

        request.onsuccess = function() {
          resolve(request.result ? request.result.value : null);
        };

        request.onerror = function() {
          reject(request.error);
        };
      });

      return entry;
    } catch (error) {
      transaction.abort();
      throw new Error(error);
    }
  }

  static async getEntryYoungest(transaction) {
    try {
      if (!transaction) transaction = db.transaction(outlayObjectStoreName);

      const entry = await new Promise(function(resolve, reject) {
        let request = transaction
          .objectStore(outlayObjectStoreName)
          .index("date_idx")
          .openCursor(null, "prev");

        request.onsuccess = function() {
          resolve(request.result ? request.result.value : null);
        };

        request.onerror = function() {
          reject(request.error);
        };
      });

      return entry;
    } catch (error) {
      transaction.abort();
      throw new Error(error);
    }
  }

  static async set(outlayEntry, transaction) {
    try {
      outlayEntry.sumAll = 0;
      for (let sum of outlayEntry.sums) {
        outlayEntry.sumAll += sum;
      }

      if (1 === outlayEntry.categories.length) {
        outlayEntry.categoryId = outlayEntry.categories[0];
      } else {
        let ancestorsAll = null;
        for (let i = 0; i < outlayEntry.categories.length; i++) {
          const categoryId = outlayEntry.categories[i];
          if (outlayEntry.sums[i]) {
            if (!categoryId) {
              ancestorsAll = null;
              break;
            }

            let ancestors = await Category.getAncestors(
              categoryId,
              transaction
            );
            if (!ancestorsAll) {
              ancestorsAll = ancestors.slice();
            } else {
              let length =
                ancestorsAll.length > ancestors.length
                  ? ancestorsAll.length
                  : ancestors.length;
              let i;
              for (i = 1; i <= length; i++) {
                if (
                  ancestorsAll[ancestorsAll.length - i] !==
                  ancestors[ancestors.length - i]
                ) {
                  ancestorsAll.splice(0, ancestorsAll.length - i + 1);
                  break;
                }
              }

              if (0 === ancestorsAll.length) break;
            }
          }
        }
        outlayEntry.categoryId =
          !ancestorsAll || 0 === ancestorsAll.length ? null : ancestorsAll[0];
      }

      if (!transaction)
        transaction = db.transaction(outlayObjectStoreName, "readwrite");

      let outlayEntryId = await new Promise(function(resolve, reject) {
        let request = transaction
          .objectStore(outlayObjectStoreName)
          .put(outlayEntry);

        request.onsuccess = function() {
          resolve(request.result);
        };

        request.onerror = function() {
          reject(request.error);
        };
      });

      return outlayEntryId;
    } catch (error) {
      transaction.abort();
      throw new Error(error);
    }
  }

  static async getEntries() {
    try {
      let dateBeg = null;
      let dateEnd = null;
      let transaction = null;
      for (let argument of arguments) {
        if (argument instanceof Object) {
          for (let property of Object.getOwnPropertyNames(argument)) {
            switch (property) {
              case "dateBeg":
                dateBeg = argument.dateBeg;
                break;
              case "dateEnd":
                dateEnd = argument.dateEnd;
                break;
            }
          }
        }
        if (argument instanceof IDBTransaction) {
          transaction = argument;
        }
      }
      if (!transaction) transaction = db.transaction(outlayObjectStoreName);

      const oulayEntries = await new Promise(function(resolve, reject) {
        let keyRange;
        if (!dateBeg && !dateEnd) {
          keyRange = null;
        } else if (dateBeg && dateEnd) {
          keyRange = IDBKeyRange.bound(dateBeg, dateEnd, false, false);
        } else if (dateBeg && !dateEnd) {
          keyRange = IDBKeyRange.lowerBound(dateBeg, false);
        } else if (!dateBeg && dateEnd) {
          keyRange = IDBKeyRange.upperBound(dateEnd, false);
        }

        const index = transaction
          .objectStore(outlayObjectStoreName)
          .index("date_idx"); // В Edge при включенных "Дополнительных инструментах разработчика" дает ошибку после получения 1-й записи: "SCRIPT1006: SCRIPT1006: Expected ')'" и "AbortError"

        const request = index.getAll(keyRange);

        request.onsuccess = function() {
          resolve(request.result);
        };

        request.onerror = function() {
          reject(request.error);
        };
      });

      return oulayEntries;
    } catch (error) {
      transaction.abort();
      throw new Error(error);
    }
  }

  get date() {
    return this.entry.date;
  }
}
