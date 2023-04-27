import type { Cylinder } from "../types";

const Cylinder = ({ position }: Cylinder) => {
  return (
    <mesh position={position}>
      <cylinderGeometry
        args={[
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          false,
          undefined,
          undefined,
        ]}
      />
      <meshStandardMaterial color={"#4be9cb"} />
    </mesh>
  );
};

export default Cylinder;
