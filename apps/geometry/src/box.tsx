import { Vector3Tuple } from "three";

export default function Box({
  position,
  rotation,
  scale,
}: {
  position?: Vector3Tuple;
  rotation?: Vector3Tuple;
  scale?: Vector3Tuple;
}) {
  return (
    <mesh position={position} rotation={rotation} scale={scale}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="pink" />
    </mesh>
  );
}
