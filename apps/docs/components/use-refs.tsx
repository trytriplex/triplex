/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { useRef } from "react";

const MAX_ITERATIONS_COUNT = 20;

function iterator(this: {
  next(): {
    done: boolean;
    value: import("react").MutableRefObject<unknown>;
  };
  [Symbol.iterator]: () => unknown;
}) {
  return this;
}

export function useRefs<T>(): React.MutableRefObject<T>[] {
  let count = 0;

  return {
    next() {
      if (++count > MAX_ITERATIONS_COUNT) {
        throw new Error("invariant: max 20");
      }

      return {
        done: false,
        // eslint-disable-next-line react-hooks/rules-of-hooks
        value: useRef<T>(),
      };
    },
    [Symbol.iterator]: iterator,
  } as never;
}
