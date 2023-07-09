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
          -0.6792821448761931, -0.22689280275926285, -0.08726646259971647,
        ]}
      />

      <Grid
        sectionColor="#9d4b4b"
        cellColor="#6f6f6f"
        cellThickness={1.0}
        infiniteGrid
        fadeDistance={30}
        cellSize={1}
        sectionSize={3}
        fadeStrength={1.5}
      />

      <mesh position={[0, 0, 0]}>
        <boxGeometry />
      </mesh>
    </>
  );
}
