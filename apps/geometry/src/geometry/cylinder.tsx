import { Vector3Tuple } from "three";

export const Cylinder = ({ position }: { position?: Vector3Tuple }) => {
  return (
    <mesh position={position}>
      <cylinderGeometry args={[1, 1, 2, 10, 1]} />
      <meshStandardMaterial color={"#4be9cb"} />
    </mesh>
  );
};

export default Cylinder;
