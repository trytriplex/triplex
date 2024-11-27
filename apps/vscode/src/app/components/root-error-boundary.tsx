/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
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
