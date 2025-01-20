/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import React from "react";

const Cylinder = ({ position = [0, 0, 0] }) => {
  return (
    <mesh position={position}>
      <cylinderGeometry />
      <meshStandardMaterial color={"#4be9cb"} />
    </mesh>
  );
};

export default Cylinder;
