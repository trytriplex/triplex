/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { Clone, useTexture } from "@react-three/drei";
import { FoliageMaterial } from "../materials/foliage";
import { Vector3Tuple } from "../types";
import { useGLTF } from "../utils/gltf";

export function Tree({
  position,
  rotation,
  scale,
}: {
  position?: Vector3Tuple;
  rotation?: Vector3Tuple;
  scale?: Vector3Tuple;
}) {
  const tree = useGLTF<"trunk" | "foliage">("/mesh/tree.glb");
  const trunk = useTexture("/textures/shaders/trunk.png");

  return (
    <group name="tree" position={position} rotation={rotation} scale={scale}>
      <Clone
        castShadow
        inject={<meshBasicMaterial map={trunk} />}
        object={tree.nodes.trunk}
        receiveShadow
      />
      <Clone
        castShadow
        inject={<FoliageMaterial />}
        object={tree.nodes.foliage}
        receiveShadow
      />
    </group>
  );
}
