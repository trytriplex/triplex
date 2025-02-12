/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
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
