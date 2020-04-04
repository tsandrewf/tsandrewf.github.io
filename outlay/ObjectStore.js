"use strict";

export class ObjectStore {
  constructor(objectStoreName) {
    this.objectStoreName = objectStoreName;
  }

  async clear(transaction) {
    const objectStoreName = this.objectStoreName;

    try {
      if (!transaction) transaction = db.transaction(objectStoreName);

      await new Promise(function(resolve, reject) {
        let request = transaction.objectStore(objectStoreName).clear();

        request.onsuccess = function() {
          resolve(request.result);
        };

        request.onerror = function() {
          reject(request.error);
        };
      });
    } catch (error) {
      transaction.abort();
      console.log("error", error.stack);
      throw new Error(error);
    }
  }

  /*static async getRecCount(objectStoreName, transaction) {
    try {
      if (!transaction)
        transaction = db.transaction(outlayCategoryObjectStoreName);

      const recCount = await new Promise(function(resolve, reject) {
        let request = transaction.objectStore(objectStoreName).count();
        request.onsuccess = function() {
          resolve(request.result);
        };
        request.onerror = function() {
          reject(request.error);
        };
      });

      return recCount;
    } catch (error) {
      transaction.abort();
      throw new Error(error);
    }
  }*/
  async getRecCount(transaction) {
    const objectStoreName = this.objectStoreName;

    try {
      if (!transaction) transaction = db.transaction(objectStoreName);

      const recCount = await new Promise(function(resolve, reject) {
        let request = transaction.objectStore(objectStoreName).count();

        request.onsuccess = function() {
          resolve(request.result);
        };

        request.onerror = function() {
          reject(request.error);
        };
      });

      return recCount;
    } catch (error) {
      transaction.abort();
      throw new Error(error);
    }
  }
}
