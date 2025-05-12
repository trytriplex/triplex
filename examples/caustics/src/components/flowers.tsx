import { useGLTF } from "@react-three/drei";
import { useLayoutEffect } from "react";
import { type Vector3Tuple } from "three";

export function Flowers({
  position,
  rotation,
  scale,
}: {
  position?: Vector3Tuple;
  rotation?: Vector3Tuple;
  scale?: Vector3Tuple;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { materials, nodes } = useGLTF("/glass-transformed.glb") as any;

  useLayoutEffect(() => {
    nodes.flowers.geometry.center();
  }, [nodes.flowers.geometry]);

  return (
    <mesh
      castShadow
      dispose={null}
      geometry={nodes.flowers.geometry}
      material={materials["draifrawer_u1_v1.001"]}
      position={position}
      rotation={rotation}
      scale={scale}
    />
  );
}
