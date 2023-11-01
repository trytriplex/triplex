/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { Gltf } from "@react-three/drei";
import asset from "../public/assets/pmndrs.glb";

export function LoadFromPublic() {
  return (
    <>
      <Gltf src={asset} />
    </>
  );
}
