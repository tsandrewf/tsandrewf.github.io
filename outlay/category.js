"use strict";

import {
  db,
  outlayObjectStoreName,
  outlayCategoryObjectStoreName,
  getCategoryChilds
} from "./db.js";

// https://habr.com/ru/company/mailru/blog/269465/
export class Category {
  static async getAncestors(categoryId, transaction) {
    /*if (!transaction)
      transaction = db.transaction(outlayCategoryObjectStoreName, "readwrite");*/
    if (!transaction)
      transaction = db.transaction(outlayCategoryObjectStoreName);

    let ancestors = [];
    while (categoryId) {
      ancestors.push(categoryId);
      let category = await Category.get(categoryId, transaction);
      categoryId = category.parentId;
    }

    return ancestors;
  }

  static async setExpanded(categoryId, expanded, transaction) {
    if (!categoryId) return;

    if (!transaction)
      transaction = db.transaction(outlayCategoryObjectStoreName, "readwrite");

    let category = await Category.get(categoryId, transaction);
    category.expanded = expanded;
    await Category.set(category, transaction);
  }

  static async getDescendants(category, transaction) {
    let categoryDescendants = [];
    let categoryChildren = await Category.getChildren(category.id, transaction);
    categoryDescendants = categoryDescendants.concat(categoryChildren);
    for (let categoryChild of categoryChildren) {
      categoryDescendants = categoryDescendants.concat(
        await Category.getDescendants(categoryChild, transaction)
      );
    }

    return categoryDescendants;
  }

  static async getChildren(categoryId, transaction) {
    try {
      if (!transaction)
        transaction = db.transaction(outlayCategoryObjectStoreName);
      return getCategoryChilds(categoryId, transaction);
    } catch (error) {
      console.log("error", error);
      return error;
    }
  }

  static async set(category, transaction) {
    try {
      if (!transaction)
        transaction = db.transaction(
          outlayCategoryObjectStoreName,
          "readwrite"
        );

      if (
        0 !== category.parentId &&
        !(await Category.get(category.parentId, transaction))
      ) {
        throw new Error(
          "НЕ найдена родительская категория (" +
            category.parentId +
            ') категории "' +
            category.name +
            '"'
        );
      }

      await new Promise(function(resolve, reject) {
        let request = transaction
          .objectStore(outlayCategoryObjectStoreName)
          .put(category);

        request.onsuccess = function() {
          resolve();
        };

        request.onerror = function() {
          reject(request.error);
        };
      });

      return category;
    } catch (error) {
      console.log("catch (error)", error.message);
      transaction.abort();
      console.log("transaction.abort()");
      throw new Error(error.message);
    }
  }

  static async add(category, transaction) {
    try {
      if (!transaction)
        transaction = db.transaction(
          outlayCategoryObjectStoreName,
          "readwrite"
        );

      await new Promise(function(resolve, reject) {
        let request = transaction
          .objectStore(outlayCategoryObjectStoreName)
          .add(category);

        request.onsuccess = function() {
          resolve();
        };

        request.onerror = function() {
          reject(request.error);
        };
      });
    } catch (error) {
      transaction.abort();
      throw new Error(error.message);
    }
  }

  static async getAll(transaction) {
    try {
      if (!transaction)
        transaction = db.transaction(outlayCategoryObjectStoreName);

      const category = await new Promise(function(resolve, reject) {
        let request = transaction
          .objectStore(outlayCategoryObjectStoreName)
          .getAll();
        request.onsuccess = function() {
          resolve(request.result);
        };
        request.onerror = function() {
          reject(request.error);
        };
      });

      return category;
    } catch (error) {
      return error;
    }
  }

  static async get(categoryId, transaction) {
    try {
      if (!categoryId) return null;

      if (!transaction)
        transaction = db.transaction(outlayCategoryObjectStoreName);

      const category = await new Promise(function(resolve, reject) {
        let request = transaction
          .objectStore(outlayCategoryObjectStoreName)
          .get(categoryId);

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

  static async getNextSibling(category, transaction) {
    try {
      const categoryNextSibling = await new Promise(function(resolve, reject) {
        let request = transaction
          .objectStore(outlayCategoryObjectStoreName)
          .index("parentCategoryId_idx")
          .get(
            IDBKeyRange.bound(
              [category.parentId, category.name],
              [category.parentId + 1],
              true,
              true
            )
          );

        request.onsuccess = function() {
          resolve(request.result);
        };

        request.onerror = function() {
          reject(request.error);
        };
      });
      return categoryNextSibling;
    } catch (error) {
      transaction.abort();
      throw new Error(error);
    }
  }

  static async getPreviousSibling(category, transaction) {
    try {
      const categoryPreviousSibling = await new Promise(function(
        resolve,
        reject
      ) {
        let request = transaction
          .objectStore(outlayCategoryObjectStoreName)
          .index("parentCategoryId_idx")
          .getAll(
            IDBKeyRange.bound(
              [category.parentId],
              [category.parentId, category.name],
              false,
              true
            )
          );

        request.onsuccess = function() {
          resolve(
            0 < request.result.length
              ? request.result[request.result.length - 1]
              : null
          );
        };

        request.onerror = function() {
          reject(request.error);
        };
      });

      return categoryPreviousSibling;
    } catch (error) {
      transaction.abort();
      throw new Error(error);
    }
  }

  static async getIsUsedReason(categoryId, transaction) {
    try {
      const reason = await new Promise(function(resolve, reject) {
        let request = transaction
          .objectStore(outlayObjectStoreName)
          .index("categoryId_idx")
          .get(categoryId);

        request.onsuccess = function() {
          if (request.result) {
            resolve(
              " ссылается как минимум одна позиция в чеке на сумму " +
                request.result.sumAll.toFixed(2) +
                " руб. за " +
                request.result.date._toStringBrief() +
                "г."
            );
          } else resolve(null);
        };

        request.onerror = function() {
          reject(request.error);
        };
      });

      return reason;
    } catch (error) {
      transaction.abort();
      throw new Error(error);
    }
  }
}
