import { Vector3Tuple } from "three";

type Plane = { position?: Vector3Tuple };

const Plane = () => (
  <mesh>
    <planeGeometry />
    <meshStandardMaterial />
  </mesh>
);

export default Plane;
