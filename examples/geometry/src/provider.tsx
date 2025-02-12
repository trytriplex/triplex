/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import type { PresetsType } from "@react-three/drei/helpers/environment-assets";
import { Physics } from "@react-three/rapier";
import { createContext, useContext, type ReactNode } from "react";

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
