/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { type ReactNode } from "react";

export function UnknownCustomComponentResolvedHostElements() {
  return (
    <>
      <ContextProvider>
        <mesh>
          <boxGeometry />
        </mesh>
      </ContextProvider>
    </>
  );
}

function ContextProvider({ children }: { children: ReactNode }) {
  return children;
}
