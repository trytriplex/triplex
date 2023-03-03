import { Clone, useTexture } from "@react-three/drei";
import { useGLTF } from "../utils/gltf";
import { FoliageMaterial } from "../materials/foliage";
import { Vector3Tuple } from "../types";

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
    <group name="tree" rotation={rotation} position={position} scale={scale}>
      <Clone
        receiveShadow
        castShadow
        object={tree.nodes.trunk}
        inject={<meshBasicMaterial map={trunk} />}
      />
      <Clone
        receiveShadow
        castShadow
        object={tree.nodes.foliage}
        inject={<FoliageMaterial />}
      />
    </group>
  );
}
