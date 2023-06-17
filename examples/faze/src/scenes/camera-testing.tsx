import { CameraEntity } from "../entities/camera-entity";
import { PlayerEntity } from "../entities/player-entity";
import { useCamera } from "../ecs/systems/camera";

export function Scene() {
  useCamera();

  return (
    <>
      <CameraEntity
        rotation={[
          -0.6806784082777885, -0.5410520681182421, -0.4014257279586958,
        ]}
        offset={[-4.25, 5, 5.5]}
      />

      <PlayerEntity position={[-0.9606338726907633, 0, 0]} />
    </>
  );
}
