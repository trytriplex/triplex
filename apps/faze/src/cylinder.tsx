import { Vector3Tuple } from "three";

export default function Cylinder({ position }: { position?: Vector3Tuple }) {
  return (
    <mesh position={position}>
      <cylinderGeometry args={[1, 1, 2, 10, 1]} />
      <meshStandardMaterial color="red" />
    </mesh>
  );
}
