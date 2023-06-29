import { Vector3Tuple } from "three";

function Box({
  position,
  rotation,
  scale,
  color,
  size = 1,
}: {
  /**
   * @min 1
   * @max 2
   */
  size?: number;
  position?: Vector3Tuple | number;
  rotation?: Vector3Tuple;
  scale?: Vector3Tuple | number;
  color?: "red" | "green" | "blue";
}) {
  const ok = {};
  return (
    <group visible={true} scale={scale}>
      <mesh
        {...ok}
        name="hello-world"
        userData={{ hello: true }}
        onClick={() => {}}
        visible={true}
        position={position}
        rotation={rotation}
      >
        <boxGeometry args={[size, size, size]} />
        <meshStandardMaterial key={color} color={color} />
      </mesh>
    </group>
  );
}

export default Box;
