/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { createContext, ReactNode, useContext } from "react";

const Context = createContext<boolean | null>(null);

export function useProvider() {
  const context = useContext(Context);
  if (!context) {
    throw new Error("invariant");
  }
}

export default function Provider({ children }: { children: ReactNode }) {
  return <Context.Provider value>{children}</Context.Provider>;
}
