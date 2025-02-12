/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { type Cylinder } from "../types";

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
