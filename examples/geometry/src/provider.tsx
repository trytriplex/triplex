/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import type { PresetsType } from "@react-three/drei/helpers/environment-assets";
import { Physics } from "@react-three/rapier";
import { createContext, type ReactNode, useContext } from "react";

const Context = createContext<boolean | null>(null);

export function useProvider() {
  const context = useContext(Context);
  if (!context) {
    throw new Error("invariant");
  }
}

export default function Provider({
  children,
  debugPhysics = true,
  enablePhysics = false,
  environment: _ = "city",
}: {
  children: ReactNode;
  debugPhysics?: boolean;
  enablePhysics?: boolean;
  environment?: PresetsType;
}) {
  return (
    <Context.Provider value>
      <Physics debug={debugPhysics} paused={!enablePhysics}>
        {children}
      </Physics>
    </Context.Provider>
  );
}
