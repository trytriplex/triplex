import { Vector3Tuple } from "three";

function Box({
  position,
  rotation,
  scale,
}: {
  position?: Vector3Tuple;
  rotation?: Vector3Tuple;
  scale?: Vector3Tuple;
}) {
  return (
    <group scale={scale}>
      <mesh position={position} rotation={rotation}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="green" />
      </mesh>
    </group>
  );
}

export default Box;
