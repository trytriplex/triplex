/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { WaterMaterial } from "../materials/water";

export function MaterialsScene() {
  return (
    <>
      <mesh
        castShadow
        name={"hello"}
        position={[-0.4, 2.224, -0.5]}
        receiveShadow
      >
        <boxGeometry args={[10, 1, 10, 10, 1, 10]} />
        <WaterMaterial
          opacity={undefined}
          speed={1}
          transparent={true}
          wavelength={50}
        />
      </mesh>
    </>
  );
}
