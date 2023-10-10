/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { PerspectiveCamera, Grid } from "@react-three/drei";

export function HeroScene() {
  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={[-6, 5, 6]}
        rotation={[
          -0.679_282_144_876_193_1, -0.226_892_802_759_262_85, -0.087_266_462_599_716_47,
        ]}
      />

      <Grid
        cellColor="#6f6f6f"
        cellSize={1}
        cellThickness={1.0}
        fadeDistance={30}
        fadeStrength={1.5}
        infiniteGrid
        sectionColor="#9d4b4b"
        sectionSize={3}
      />

      <mesh position={[0, 0, 0]}>
        <boxGeometry />
      </mesh>
    </>
  );
}
