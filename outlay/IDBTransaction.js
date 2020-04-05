"use strict";

IDBTransaction.prototype._abortIfActive = function () {
  try {
    this.abort();
  } catch (error) {
    if (11 !== error.code) {
      // 11 has legacy constant name: INVALID_STATE_ERR
      //throw error;
      console.log("Ошибка отмены транзакции");
    }
  }
};
