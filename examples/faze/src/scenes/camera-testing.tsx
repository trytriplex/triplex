/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { PerspectiveCamera } from "@react-three/drei";
import { useCamera } from "../ecs/systems/camera";
import { CameraEntity } from "../entities/camera-entity";
import { PlayerEntity } from "../entities/player-entity";

export function Scene() {
  useCamera();

  return (
    <>
      <CameraEntity
        offset={[-4.25, 5, 5.5]}
        rotation={[
          -0.680_678_408_277_788_5, -0.541_052_068_118_242_1,
          -0.401_425_727_958_695_8,
        ]}
      />

      <PlayerEntity position={[0, 0, 0]} />

      <PerspectiveCamera
        position={[
          -0.141_646_936_469_016_94, 1.732_122_037_827_79,
          2.068_985_775_667_036,
        ]}
        rotation={[-0.249_804_765_644_363_16, 0, 0]}
      />

      <mesh
        position={[-0.061_427_483_068_584_81, -0.104_989_602_568_576_15, 0]}
        receiveShadow={true}
      >
        <boxGeometry args={[10, 0.2, 5]} />
        <meshStandardMaterial />
      </mesh>
      <pointLight
        castShadow={true}
        color={"#a8cfd7"}
        position={[
          -1.269_954_107_470_605_6, 1.417_475_955_093_191_7,
          -0.960_340_537_296_764_2,
        ]}
      />

      <ambientLight
        intensity={0.2}
        position={[0, 0.179_227_551_991_491_76, 0]}
      />
    </>
  );
}
