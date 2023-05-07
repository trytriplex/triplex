import { Vector3Tuple } from "three";

export default function Sphere({
  position,
  rotation,
  scale,
}: {
  position?: Vector3Tuple;
  rotation?: Vector3Tuple;
  scale?: Vector3Tuple;
}) {
  return (
    <mesh
      position={position}
      rotation={rotation}
      scale={scale}
      name={undefined}
    >
      <sphereGeometry
        args={[
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
        ]}
      />
      <meshStandardMaterial color={"#84f4ea"} />
    </mesh>
  );
}
