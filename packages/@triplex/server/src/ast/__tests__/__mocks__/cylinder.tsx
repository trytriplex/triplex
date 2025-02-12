/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
function Cylinder({ position }: { position?: [number, number, number] }) {
  return (
    <mesh name="this-is-cilly" position={position}>
      <cylinderGeometry args={[undefined, 1, 2, 10, 1]} name={"geo-hi"} />
      <meshStandardMaterial color="red" />
    </mesh>
  );
}

export default Cylinder;
