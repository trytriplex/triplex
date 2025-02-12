/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
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
