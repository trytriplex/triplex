import { CameraEntity } from "../entities/camera-entity";
import { PlayerEntity } from "../entities/player-entity";
import { useCamera } from "../ecs/systems/camera";
import { PerspectiveCamera } from "@react-three/drei";

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

      <PlayerEntity position={[-0.9604949128687132, 0, 0]} />

      <PerspectiveCamera position={[0, 0, 0.7469631272109094]} />
    </>
  );
}
