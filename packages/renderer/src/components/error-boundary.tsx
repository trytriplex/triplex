/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
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
