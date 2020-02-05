"use strict";

import { db, settingObjectStoreName } from "./db.js";

export class Setting {
  static async get(key, transaction) {
    try {
      if (!transaction) transaction = db.transaction(settingObjectStoreName);

      const value = await new Promise(function(resolve, reject) {
        let request = transaction.objectStore(settingObjectStoreName).get(key);

        request.onsuccess = function() {
          resolve(request.result ? request.result.value : null);
        };

        request.onerror = function() {
          reject(request.error);
        };
      });

      return value;
    } catch (error) {
      transaction.abort();
      throw new Error(error);
    }
  }

  static async set(id, value, transaction) {
    try {
      if (!transaction)
        transaction = db.transaction(settingObjectStoreName, "readwrite");

      await new Promise(function(resolve, reject) {
        let request = transaction
          .objectStore(settingObjectStoreName)
          .put({ value: value, id: id });

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
}
