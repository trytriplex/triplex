/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { createContext, ReactNode, useContext } from "react";
import { Physics } from "@react-three/rapier";

const Context = createContext<boolean | null>(null);

export function useProvider() {
  const context = useContext(Context);
  if (!context) {
    throw new Error("invariant");
  }
}

export default function Provider({
  children,
  paused = false,
  debug = true,
}: {
  children: ReactNode;
  paused?: boolean;
  debug?: boolean;
}) {
  return (
    <Context.Provider value>
      <Physics paused={paused} debug={debug}>
        {children}
      </Physics>
    </Context.Provider>
  );
}
