/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
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
