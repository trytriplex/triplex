import { RigidBody } from "@react-three/rapier";
import { type Vector3Tuple } from "three";

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
    <RigidBody
      canSleep={false}
      colliders={"ball"}
      position={position}
      rotation={rotation}
      scale={scale}
    >
      <mesh castShadow={true} receiveShadow={true}>
        <sphereGeometry />
        <meshStandardMaterial color={"#84f4ea"} />
      </mesh>
    </RigidBody>
  );
}
