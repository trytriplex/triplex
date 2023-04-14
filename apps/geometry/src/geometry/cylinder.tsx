import type { Cylinder } from "../types";

const Cylinder = ({ position }: Cylinder) => {
  return (
    <mesh position={position}>
      <cylinderGeometry args={[1, 1, 2, 10, 1]} />
      <meshStandardMaterial color={"#4be9cb"} />
    </mesh>
  );
};

export default Cylinder;
