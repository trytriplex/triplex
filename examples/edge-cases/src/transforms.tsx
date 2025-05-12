import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { type Object3D, type Vector3Tuple } from "three";

export function Scene() {
  return (
    <>
      <TransformedInsideGroup position={[-1.53, 0.2, -0.31]} />
      <TransformedGroup position={[1.13, 0.339_474_031_421_549, 0.83]} />
      <EmulatedTransforms position={[-0.03, 0, -0.58]} />
    </>
  );
}

export function TransformedInsideGroup({
  position,
  rotation,
  scale,
}: {
  position?: [x: number, y: number, z: number];
  rotation?: Vector3Tuple;
  scale?: Vector3Tuple;
}) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh
        position={[0, 0, 1]}
        rotation={[
          0.528_512_178_326_088_7, 0.685_092_229_847_020_3,
          -0.344_538_193_744_515_5,
        ]}
        scale={0.9}
      >
        <boxGeometry />
        <meshStandardMaterial color="red" />
      </mesh>
    </group>
  );
}

export function TransformedGroup({
  position,
  rotation,
  scale,
}: {
  position?: [x: number, y: number, z: number];
  rotation?: Vector3Tuple;
  scale?: Vector3Tuple;
}) {
  return (
    <group
      position={[0, 0, 1]}
      rotation={[
        0.528_512_178_326_088_7, 0.685_092_229_847_020_3,
        -0.344_538_193_744_515_5,
      ]}
      scale={0.9}
    >
      <mesh position={position} rotation={rotation} scale={scale}>
        <boxGeometry />
        <meshStandardMaterial color="green" />
      </mesh>
    </group>
  );
}

export function EmulatedTransforms({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = [1, 1, 1],
}: {
  position?: [x: number, y: number, z: number];
  rotation?: [x: number, y: number, z: number];
  scale?: [number, number, number];
}) {
  const ref = useRef<Object3D>(undefined);

  useFrame(() => {
    ref.current?.position.fromArray(position);
    ref.current?.rotation.fromArray(rotation);
    ref.current?.scale.fromArray(scale);
  });

  return (
    <>
      <mesh ref={ref}>
        <boxGeometry />
        <meshStandardMaterial color="blue" />
      </mesh>
      <mesh position={position} rotation={rotation} scale={scale} />
    </>
  );
}
