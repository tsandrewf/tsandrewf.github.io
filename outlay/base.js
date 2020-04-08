"use strict";

export function throwErrorIfNotNull(reason) {
  if (reason) throw new Error(reason);
}
