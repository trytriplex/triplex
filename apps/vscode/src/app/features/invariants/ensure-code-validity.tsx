/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import { useEffect, useState, type ReactNode } from "react";
import {
  clearQuery,
  preloadSubscription,
  useSubscription,
} from "../../hooks/ws";
import { useSceneContext } from "../app-root/context";
import { InvalidCodeSplash } from "./splash-invalid-code";

export function EnsureCodeValidity({ children }: { children: ReactNode }) {
  const context = useSceneContext();
  const diagnostics = useSubscription("/scene/:path/diagnostics", {
    path: context.path,
  });
  const [shouldShowChildren, setShouldShowChildren] = useState(
    diagnostics.length === 0,
  );
  const codeHasSyntaxErrors = diagnostics.length > 0;

  useEffect(() => {
    if (diagnostics.length === 0 && !shouldShowChildren) {
      clearQuery("/scene/:path/:exportName", context);
      clearQuery("/scene/:path/:exportName/props", context);
      setShouldShowChildren(true);
    }
  }, [context, diagnostics, shouldShowChildren]);

  return (
    <>
      <div
        // @ts-expect-error — Will be fixed in a future version of @types/react
        inert={codeHasSyntaxErrors ? "true" : undefined}
      >
        {shouldShowChildren && children}
      </div>
      {codeHasSyntaxErrors && (
        <InvalidCodeSplash diagnostics={diagnostics} path={context.path} />
      )}
    </>
  );
}

preloadSubscription("/scene/:path/diagnostics", {
  path: window.triplex.initialState.path,
});
