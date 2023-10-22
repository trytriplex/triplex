/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { createContext, ReactNode, useContext } from "react";
import { suspend } from "suspend-react";

type Env = Awaited<ReturnType<typeof window.triplex.getEnv>>;

const Context = createContext<Env | null>(null);

export function useEnvironment() {
  const context = useContext(Context);
  if (!context) {
    throw new Error("invariant");
  }

  return context;
}

export function Environment({ children }: { children: ReactNode }) {
  const data: Env = suspend(
    () =>
      __TRIPLEX_TARGET__ === "electron"
        ? window.triplex.getEnv()
        : Promise.resolve({
            config: { provider: "", sceneUrl: "", serverUrl: "", wsUrl: "" },
          }),
    []
  );

  return <Context.Provider value={data}>{children}</Context.Provider>;
}
