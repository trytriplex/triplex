/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { WaterMaterial } from "../materials/water";

export function MaterialsScene() {
  return (
    <>
      <mesh
        receiveShadow
        castShadow
        position={[-0.4, 2.224, -0.5]}
        name={"hello"}
      >
        <boxGeometry args={[10, 1, 10, 10, 1, 10]} />
        <WaterMaterial
          wavelength={50}
          speed={1}
          opacity={undefined}
          transparent={true}
        />
      </mesh>
    </>
  );
}
