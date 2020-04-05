"use strict";

import { db, settingObjectStoreName } from "./db.js";
import { ObjectStore } from "./objectStore.js";

export class Setting {
  static async getAll(transaction) {
    try {
      if (!transaction) transaction = db.transaction(settingObjectStoreName);

      const category = await new Promise(function (resolve, reject) {
        let request = transaction.objectStore(settingObjectStoreName).getAll();

        request.onsuccess = function () {
          resolve(request.result);
        };

        request.onerror = function () {
          reject(request.error);
        };
      });

      return category;
    } catch (error) {
      if (transaction && !transaction.error) transaction.abort();
      throw new Error(error);
    }
  }

  static async get(key, transaction) {
    const record = await ObjectStore.get(
      settingObjectStoreName,
      key,
      transaction
    );
    return record ? record.value : null;
  }

  static async set(id, value, transaction) {
    await ObjectStore.set(
      settingObjectStoreName,
      { id: id, value: value },
      transaction
    );
  }
}
