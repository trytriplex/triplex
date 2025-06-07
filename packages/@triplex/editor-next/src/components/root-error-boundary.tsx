/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import { on } from "@triplex/bridge/host";
import { useEffect, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorSplash } from "../features/error-splash";

export function RootErrorBoundary({ children }: { children: React.ReactNode }) {
  const [error, setError] = useState<{
    col?: number;
    id?: string;
    line?: number;
    message: string;
    source?: string;
    stack?: string;
  }>();

  useEffect(() => {
    return on("error", (err) => {
      if (err.type !== "unrecoverable") {
        return;
      }

      setError(err);
    });
  }, []);

  if (error) {
    return <ErrorSplash error={error} />;
  }

  return (
    <ErrorBoundary
      fallbackRender={({ error }) => <ErrorSplash error={error} />}
    >
      {children}
    </ErrorBoundary>
  );
}
