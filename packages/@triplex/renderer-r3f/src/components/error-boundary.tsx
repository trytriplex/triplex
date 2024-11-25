/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { compose, on } from "@triplex/bridge/client";
import { useEffect, useReducer, useState, type PropsWithChildren } from "react";
import {
  ErrorBoundary,
  type ErrorBoundaryPropsWithRender,
} from "react-error-boundary";

export function ErrorBoundaryForScene({
  children,
  fallbackRender,
  onError,
  onResetKeysChange,
  resetKeys = [],
}: PropsWithChildren<
  Pick<
    ErrorBoundaryPropsWithRender,
    "onResetKeysChange" | "resetKeys" | "fallbackRender" | "onError"
  >
>) {
  const [resetCount, increment] = useReducer((count: number) => count + 1, 0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    return compose([
      on("request-refresh-scene", increment),
      on("self:request-reset-error-boundary", increment),
    ]);
  }, [isActive]);

  return (
    <ErrorBoundary
      fallbackRender={fallbackRender}
      onError={(err, info) => {
        setIsActive(true);
        onError?.(err, info);
      }}
      onReset={() => setIsActive(false)}
      onResetKeysChange={onResetKeysChange}
      resetKeys={[...resetKeys, resetCount]}
    >
      {children}
    </ErrorBoundary>
  );
}
