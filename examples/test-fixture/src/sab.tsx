/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { useState } from "react";

export function SharedArrayBufferTest() {
  const [] = useState(() => new SharedArrayBuffer(2));
  return (
    <mesh>
      <boxGeometry />
    </mesh>
  );
}
