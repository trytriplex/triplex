/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { Grid, PerspectiveCamera } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

export default function HeroCanvas() {
  return (
    <Canvas
      className="inset-0 -z-10"
      eventSource={document.documentElement}
      shadows
      style={{ pointerEvents: "none", position: "fixed" }}
    >
      <PerspectiveCamera
        makeDefault
        position={[0, 6.92, 13.68]}
        rotation={[-0.374_547_657_477_983_13, 0, 0]}
      />
      <Grid
        cellColor="#6f6f6f"
        cellSize={2}
        cellThickness={1.0}
        fadeDistance={30}
        fadeStrength={2}
        infiniteGrid
        sectionColor="#9d4b4b"
        sectionSize={6}
      />
    </Canvas>
  );
}
