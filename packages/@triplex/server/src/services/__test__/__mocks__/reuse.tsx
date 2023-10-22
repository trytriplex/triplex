/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import Scene from "./add-prop";

export function Reuse() {
  return (
    <>
      <Scene />
    </>
  );
}

export const NamedExport = () => {
  return (
    <>
      <Reuse></Reuse>
    </>
  );
};
