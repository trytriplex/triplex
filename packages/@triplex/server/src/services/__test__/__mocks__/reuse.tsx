/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
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
