/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { createContext, useContext } from "react";

const Context = createContext(false);

export function useBoolean() {
  const value = useContext(Context);
  if (!value) {
    throw new Error("invariant: no context found");
  }

  return value;
}

export function NeedsRequiredContext() {
  const isTrue = useBoolean();

  return (
    <mesh visible={isTrue}>
      <boxGeometry />
    </mesh>
  );
}
