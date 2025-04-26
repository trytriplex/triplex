import { Camera } from "../entities/camera";
import { Controller } from "../entities/controller";
import { Cursor } from "../entities/cursor";
import { Land } from "../entities/land";

export function DebugLevel() {
  return (
    <>
      <Camera position={[0, 3, 0]} rotation={[-0.87, -0.56, -0.57]} />
      <Controller speed={5}>
        <mesh castShadow position={[0, 0.4, 0]} receiveShadow>
          <boxGeometry args={[0.3, 0.8, 0.3]} />
          <meshStandardMaterial color="red" />
        </mesh>
      </Controller>
      <Cursor />
      <Land>
        <mesh position={[0, -0.06, 0]} receiveShadow>
          <boxGeometry args={[6, 0.1, 6]} />
          <meshStandardMaterial color="white" />
        </mesh>
      </Land>
      <ambientLight />
      <directionalLight
        castShadow
        intensity={1}
        position={[-2.97, 3.17, 0]}
        shadow-mapSize-height={1024}
        shadow-mapSize-width={1024}
      />
    </>
  );
}
