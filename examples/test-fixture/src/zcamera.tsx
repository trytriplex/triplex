/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { PerspectiveCamera } from "@react-three/drei";

export function Camera() {
  return (
    <>
      <PerspectiveCamera position={[0, 1.9, 6.7]} />
    </>
  );
}
