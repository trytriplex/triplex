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

      <PlayerEntity position={[0, 0, 0]} />

      <PerspectiveCamera
        position={[-0.14164693646901694, 1.73212203782779, 2.068985775667036]}
        rotation={[-0.24980476564436316, 0, 0]}
      />

      <mesh
        position={[-0.06142748306858481, -0.10498960256857615, 0]}
        receiveShadow={true}
      >
        <boxGeometry args={[10, 0.2, 5]} />
        <meshStandardMaterial />
      </mesh>
      <pointLight
        position={[
          -1.2699541074706056, 1.4174759550931917, -0.9603405372967642,
        ]}
        castShadow={true}
        color={"#a8cfd7"}
      />

      <ambientLight intensity={0.2} position={[0, 0.17922755199149176, 0]} />
    </>
  );
}
