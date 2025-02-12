/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useInsertionEffect, useRef } from "react";

type AnyFunction = (...args: any[]) => any;

/**
 * Similar to useCallback, with a few subtle differences:
 *
 * - The returned function is a stable reference, and will always be the same
 *   between renders
 * - No dependency lists required
 * - Properties or state accessed within the callback will always be "current"
 */
export function useEvent<TCallback extends AnyFunction>(
  callback: TCallback,
): TCallback {
  // Keep track of the latest callback:
  const latestRef = useRef<TCallback>(
    invariant_shouldNotBeInvokedBeforeMount as any,
  );

  useInsertionEffect(() => {
    latestRef.current = callback;
  }, [callback]);

  const stableRef = useRef<TCallback>(null as any);
  // eslint-disable-next-line react-compiler/react-compiler
  if (!stableRef.current) {
    // eslint-disable-next-line react-compiler/react-compiler
    stableRef.current = ((...args: any[]) => {
      return latestRef.current(...args);
    }) as TCallback;
  }

  // eslint-disable-next-line react-compiler/react-compiler
  return stableRef.current;
}

/**
 * Render methods should be pure, especially when concurrency is used, so we
 * will throw this error if the callback is called while rendering.
 */
function invariant_shouldNotBeInvokedBeforeMount() {
  throw new Error(
    "INVALID_USEEVENT_INVOCATION: the callback from useEvent cannot be invoked before the component has mounted.",
  );
}

export default useEvent;
