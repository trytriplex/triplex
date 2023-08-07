/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { PerspectiveCamera, Grid } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Group } from "three";
import { easing } from "maath";
import { ExplodingBox } from "./exploding-box";

export function HeroScene() {
  const ref = useRef<Group>(null!);

  useFrame((state, delta) => {
    easing.dampE(
      ref.current.rotation,
      [(state.pointer.y * Math.PI) / 50, (state.pointer.x * Math.PI) / 20, 0],
      0.05,
      delta
    );
  });

  return (
    <>
      <PerspectiveCamera
        makeDefault
        rotation={[-0.37454765747798313, 0, 0]}
        position={[0, 6.92, 13.68]}
      />

      <ambientLight args={[undefined, 0.5]} />

      <group ref={ref}>
        <directionalLight
          castShadow
          position={[
            -1.1698257671920271, 8.44714248022657, -15.512714311161407,
          ]}
          color={"#60a5fa"}
          intensity={1}
        />
      </group>

      <pointLight
        castShadow
        position={[-3.2057934735079705, 3.2807808056064145, 3.4583818625881166]}
        color={"#ff0000"}
        intensity={1}
      />

      <ExplodingBox
        stage
        rotation={[0, -0.7853981633974483, 0]}
        position={[-1.4, 0.22, 0]}
      />

      <Grid
        sectionColor="#9d4b4b"
        cellColor="#6f6f6f"
        cellThickness={1.0}
        infiniteGrid
        fadeDistance={30}
        cellSize={2}
        sectionSize={6}
        fadeStrength={2}
      />
    </>
  );
}
