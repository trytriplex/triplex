import { useGLTF } from "@react-three/drei";
import { useLayoutEffect } from "react";
import { Vector3Tuple } from "three";

export function Straw({
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
    nodes.straw_1.geometry.center();
    nodes.straw_2.geometry.center();
  }, [nodes.straw_1.geometry, nodes.straw_2.geometry]);

  return (
    <group scale={scale} position={position} rotation={rotation}>
      <mesh
        dispose={null}
        castShadow
        geometry={nodes.straw_1.geometry}
        material={materials.straw_2}
      />
      <mesh
        dispose={null}
        castShadow
        geometry={nodes.straw_2.geometry}
        material={materials.straw_1}
      />
    </group>
  );
}
