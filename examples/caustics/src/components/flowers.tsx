import { useGLTF } from "@react-three/drei";
import { useLayoutEffect } from "react";
import { Vector3Tuple } from "three";

export function Flowers({
  scale,
  position,
  rotation,
}: {
  scale?: Vector3Tuple;
  position?: Vector3Tuple;
  rotation?: Vector3Tuple;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { nodes, materials } = useGLTF("/glass-transformed.glb") as any;

  useLayoutEffect(() => {
    nodes.flowers.geometry.center();
  }, [nodes.flowers.geometry]);

  return (
    <mesh
      dispose={null}
      scale={scale}
      position={position}
      rotation={rotation}
      castShadow
      geometry={nodes.flowers.geometry}
      material={materials["draifrawer_u1_v1.001"]}
    />
  );
}
