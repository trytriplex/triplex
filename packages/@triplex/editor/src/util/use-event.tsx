/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
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
  callback: TCallback
): TCallback {
  // Keep track of the latest callback:
  const latestRef = useRef<TCallback>(beforeMountInvariant as any);

  useInsertionEffect(() => {
    latestRef.current = callback;
  }, [callback]);

  const stableRef = useRef<TCallback>(null as any);
  if (!stableRef.current) {
    stableRef.current = ((...args: any[]) => {
      return latestRef.current(...args);
    }) as TCallback;
  }

  return stableRef.current;
}

/**
 * Render methods should be pure, especially when concurrency is used, so we
 * will throw this error if the callback is called while rendering.
 */
function beforeMountInvariant() {
  throw new Error(
    "INVALID_USE_EVENT_INVOCATION: the callback from useEvent cannot be invoked before the component has mounted."
  );
}

export default useEvent;
