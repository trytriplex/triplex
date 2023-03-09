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
  const ok = {};
  return (
    <group visible={true} scale={scale}>
      <mesh
        {...ok}
        userData={{ hello: true }}
        onClick={() => {}}
        visible={true}
        position={position}
        rotation={rotation}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#00ff00" />
      </mesh>
    </group>
  );
}

export default Box;
