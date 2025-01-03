/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { useFrame } from "@react-three/fiber";
import { easing } from "maath";
import { useRef } from "react";
import { type Group } from "three";
import { ExplodingBox } from "./exploding-box";

export function HeroScene() {
  const ref = useRef<Group>(null!);

  useFrame((state, delta) => {
    easing.dampE(
      ref.current.rotation,
      [(state.pointer.y * Math.PI) / 50, (state.pointer.x * Math.PI) / 20, 0],
      0.05,
      delta,
    );
  });

  return (
    <>
      <ambientLight args={[undefined, 1]} />

      <group ref={ref}>
        <directionalLight
          castShadow
          color={"#60a5fa"}
          intensity={10}
          position={[
            -1.169_825_767_192_027_1, 8.447_142_480_226_57,
            -15.512_714_311_161_407,
          ]}
        />
      </group>

      <pointLight
        castShadow
        color={"#ff0000"}
        intensity={50}
        position={[-5, 5, 2.5]}
      />

      <ExplodingBox
        position={[-1.4, 0.22, 0]}
        rotation={[0, -0.785_398_163_397_448_3, 0]}
        stage={true}
      />
    </>
  );
}
