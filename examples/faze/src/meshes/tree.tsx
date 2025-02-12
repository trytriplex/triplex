/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { Clone, useTexture } from "@react-three/drei";
import { FoliageMaterial } from "../materials/foliage";
import { type Vector3Tuple } from "../types";
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
