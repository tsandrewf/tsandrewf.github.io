"use strict";

import {
  db,
  outlayObjectStoreName,
  outlayCategoryObjectStoreName,
  getCategoryChilds,
} from "./db.js";

export class ObjectStore {
  constructor(objectStoreName) {
    this.objectStoreName = objectStoreName;

    this.set = async function (record, transaction) {
      ObjectStore.set(this.objectStoreName, record, transaction);
    };
  }

  async restoreRecord(record, transaction) {
    const objectStoreName = this.objectStoreName;

    try {
      if (!transaction)
        transaction = db.transaction(objectStoreName, "readwrite");

      await new Promise(function (resolve, reject) {
        const request = transaction.objectStore(objectStoreName).add(record);

        request.onsuccess = function () {
          resolve();
        };

        request.onerror = function () {
          reject(request.error);
        };
      });
    } catch (error) {
      transaction._abortIfActive();
      throw new Error(error);
    }
  }

  async clear(transaction) {
    const objectStoreName = this.objectStoreName;

    try {
      if (!transaction) transaction = db.transaction(objectStoreName);

      await new Promise(function (resolve, reject) {
        const request = transaction.objectStore(objectStoreName).clear();

        request.onsuccess = function () {
          resolve();
        };

        request.onerror = function () {
          reject(request.error);
        };
      });
    } catch (error) {
      transaction._abortIfActive();
      throw new Error(error);
    }
  }

  async getRecCount(transaction) {
    const objectStoreName = this.objectStoreName;

    try {
      if (!transaction) transaction = db.transaction(objectStoreName);

      const recCount = await new Promise(function (resolve, reject) {
        let request = transaction.objectStore(objectStoreName).count();

        request.onsuccess = function () {
          resolve(request.result);
        };

        request.onerror = function () {
          reject(request.error);
        };
      });

      return recCount;
    } catch (error) {
      transaction._abortIfActive();
      throw new Error(error);
    }
  }

  static async get(objectStoreName, key, transaction) {
    if (!key) return null;

    try {
      if (!transaction) transaction = db.transaction(objectStoreName);

      const record = await new Promise(function (resolve, reject) {
        let request = transaction.objectStore(objectStoreName).get(key);

        request.onsuccess = function () {
          resolve(request.result);
        };

        request.onerror = function () {
          reject(request.error);
        };
      });

      return record;
    } catch (error) {
      transaction._abortIfActive();
      throw new Error(error);
    }
  }

  static async set(objectStoreName, record, transaction) {
    try {
      if (!transaction)
        transaction = db.transaction(objectStoreName, "readwrite");

      const retVal = await new Promise(function (resolve, reject) {
        const request = transaction.objectStore(objectStoreName).put(record);

        request.onsuccess = function () {
          resolve();
        };

        request.onerror = function () {
          reject(request.error);
        };
      });

      return retVal;
    } catch (error) {
      transaction._abortIfActive();
      throw new Error(error);
    }
  }
}
