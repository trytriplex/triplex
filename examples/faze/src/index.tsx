/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { MathUtils } from "three";
import { Systems } from "./ecs/system";
import { CameraEntity } from "./entities/camera-entity";
import { FollowPointerEntity } from "./entities/follow-pointer-entity";
import { MaterialsScene } from "./scenes/materials";
import { ParkScene } from "./scenes/park";
import { SandboxScene } from "./scenes/sandbox";

const scenes: Record<string, JSX.Element> = {
  materials: <MaterialsScene />,
  park: <ParkScene />,
  sandbox: <SandboxScene />,
};

export function Game() {
  const sceneJsx = scenes.park;

  return (
    <>
      {sceneJsx}
      <CameraEntity
        offset={[-4.25, 5, 5.5]}
        rotation={[
          MathUtils.degToRad(-39),
          MathUtils.degToRad(-31),
          MathUtils.degToRad(-23),
        ]}
      />
      <FollowPointerEntity />
      <Systems />
    </>
  );
}
