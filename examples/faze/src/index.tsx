import { SandboxScene } from "./scenes/sandbox";
import { ParkScene } from "./scenes/park";
import { Systems } from "./ecs/system";
import { CameraEntity } from "./entities/camera-entity";
import { FollowPointerEntity } from "./entities/follow-pointer-entity";
import { MathUtils } from "three";
import { MaterialsScene } from "./scenes/materials";

const scenes: Record<string, JSX.Element> = {
  park: <ParkScene />,
  materials: <MaterialsScene />,
  sandbox: <SandboxScene />,
};

export function Game() {
  const sceneJsx = scenes.park;

  return (
    <>
      {sceneJsx}
      <CameraEntity
        rotation={[
          MathUtils.degToRad(-39),
          MathUtils.degToRad(-31),
          MathUtils.degToRad(-23),
        ]}
        offset={[-4.25, 5, 5.5]}
      />
      <FollowPointerEntity />
      <Systems />
    </>
  );
}
