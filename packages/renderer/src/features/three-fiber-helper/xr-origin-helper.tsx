/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import { DoubleSide, MathUtils } from "three";

export function XROriginHelper({ color }: { color: string }) {
  return (
    <>
      <mesh position={[0, 0, 0]} rotation={[MathUtils.degToRad(-90), 0, 0]}>
        <ringGeometry args={[0.65, 0.7]} />
        <meshBasicMaterial color={color} side={DoubleSide} />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.1]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </>
  );
}
