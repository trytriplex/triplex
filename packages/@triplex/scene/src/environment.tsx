/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { createContext, ReactNode, useContext, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

const Context = createContext<{ config: { provider: string } } | null>(null);

export function useEnvironment() {
  const context = useContext(Context);
  if (!context) {
    throw new Error("invariant");
  }

  return context;
}

export function Environment({ children }: { children: ReactNode }) {
  const [searchParams] = useSearchParams();
  // Env is loaded once and then never changes during a session.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const env = useMemo(() => searchParams.get("env"), []);
  if (!env) {
    throw new Error("invariant: env param missing");
  }

  return (
    <Context.Provider value={JSON.parse(env)}>{children}</Context.Provider>
  );
}
