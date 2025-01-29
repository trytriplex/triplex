/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
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
