/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { useState } from "react";

const $empty = Symbol.for("react.memo_cache_sentinel");

export function c(size) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useState(() => {
    const $ = new Array(size);
    for (let ii = 0; ii < size; ii++) {
      $[ii] = $empty;
    }
    $[$empty] = true;
    return $;
  })[0];
}
