"use strict";

import {
  db,
  outlayObjectStoreName,
  outlayCategoryObjectStoreName
} from "./db.js";
import { Category } from "./category.js";

export class OutlayEntry {
  constructor(entry) {
    this.entry = entry;
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
      return error;
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
        /*for (let categoryId of outlayEntry.categories)*/
        for (let i = 0; i < outlayEntry.categories.length; i++) {
          const categoryId = outlayEntry.categories[i];
          if (outlayEntry.sums[i]) {
            if (!categoryId) {
              ancestorsAll = null;
              break;
            }

            let ancestors = await Category.getAncestors(categoryId);
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

  static async getEntries(transaction) {
    try {
      if (!transaction) transaction = db.transaction(outlayObjectStoreName);

      const oulayEntries = await new Promise(function(resolve, reject) {
        let request = transaction
          .objectStore(outlayObjectStoreName)
          .index("date_idx") // В Edge при включенных "Дополнительных инструментах разработчика" дает ошибку после получения 1-й записи: "SCRIPT1006: SCRIPT1006: Expected ')'" и "AbortError"
          .getAll();

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
