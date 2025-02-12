/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
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
        value: useRef<T>(undefined),
      };
    },
    [Symbol.iterator]: iterator,
  } as never;
}
