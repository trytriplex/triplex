/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { MapControls, PerspectiveCamera } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import Box from "./geometry/box";

interface SceneProps {
  name?: string;
  value?: number;
  variant?: "giant" | "small";
  visible?: boolean;
}

export function Scene({
  name: ___ = "jelly",
  value: __ = 100,
  variant: _ = "giant",
  visible: ____ = true,
}: SceneProps) {
  return (
    <>
      <ambientLight position={[2.12, 0, -0.88]} />
      <Box scale={1.5} />
      <PerspectiveCamera
        makeDefault={true}
        name={"user_defined"}
        position={[-1.831_592_557_014_578_1, 0.943_661_973_904_340_8, 0]}
        rotation={[
          -1.570_796_326_794_896_6, -1.221_730_476_396_030_6,
          -1.570_796_326_794_896_6,
        ]}
      />
      <group>
        <mesh position={[1.6, 0, -1.7]}>
          <boxGeometry />
          <meshStandardMaterial />
        </mesh>
      </group>

      <MapControls />

      <EffectComposer enabled={false}>
        <Bloom />
      </EffectComposer>
    </>
  );
}

export function Plane() {
  return (
    <mesh>
      <planeGeometry />
    </mesh>
  );
}
