/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
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
        sectionColor="#fff"
        sectionSize={6}
      />
    </Canvas>
  );
}
