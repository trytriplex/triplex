/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { memo } from "react";

type Box = { position?: number };

const Box = ({ position }: Box) => {
  return (
    <mesh position={position}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="pink" />
    </mesh>
  );
};

export default memo(Box);
