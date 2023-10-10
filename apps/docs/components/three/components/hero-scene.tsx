/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { Grid, PerspectiveCamera } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { easing } from "maath";
import { useRef } from "react";
import { Group } from "three";
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
        position={[0, 6.92, 13.68]}
        rotation={[-0.374_547_657_477_983_13, 0, 0]}
      />

      <ambientLight args={[undefined, 0.5]} />

      <group ref={ref}>
        <directionalLight
          castShadow
          color={"#60a5fa"}
          intensity={1}
          position={[
            -1.169_825_767_192_027_1, 8.447_142_480_226_57,
            -15.512_714_311_161_407,
          ]}
        />
      </group>

      <pointLight
        castShadow
        color={"#ff0000"}
        intensity={1}
        position={[
          -3.205_793_473_507_970_5, 3.280_780_805_606_414_5,
          3.458_381_862_588_116_6,
        ]}
      />

      <ExplodingBox
        position={[-1.4, 0.22, 0]}
        rotation={[0, -0.785_398_163_397_448_3, 0]}
        stage
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
    </>
  );
}
