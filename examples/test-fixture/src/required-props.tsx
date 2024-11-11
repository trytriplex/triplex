/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */

import { Gltf } from "@react-three/drei";

export function RequiredProps({
  color = "red",
  size,
}: {
  color: string;
  size: number;
}) {
  return (
    <>
      <Gltf scale={size} src="assets/pmndrs.glb">
        <meshStandardMaterial color={color} />
      </Gltf>
    </>
  );
}
