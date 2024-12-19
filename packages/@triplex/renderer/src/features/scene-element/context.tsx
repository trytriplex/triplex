/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { type TriplexMeta } from "@triplex/bridge/client";
import { createContext, Fragment, useContext, useMemo } from "react";

export const SceneObjectContext = createContext(false);

export const ParentComponentMetaContext = createContext<TriplexMeta[]>([]);

export function ParentComponentMetaProvider({
  children,
  type,
  value,
}: {
  children: React.ReactNode;
  type: "host" | "custom";
  value: TriplexMeta;
}) {
  const parents = useContext(ParentComponentMetaContext);
  // We keep a list of all parents at each level because not all nodes
  // are injected into the Three.js scene. Meaning if we just used a single
  // parent we'd lose data.
  const values = useMemo(() => [value, ...parents], [parents, value]);

  if (type === "host") {
    // We only store parent data of custom components.
    return <Fragment>{children}</Fragment>;
  }

  return (
    <ParentComponentMetaContext.Provider value={values}>
      {children}
    </ParentComponentMetaContext.Provider>
  );
}
