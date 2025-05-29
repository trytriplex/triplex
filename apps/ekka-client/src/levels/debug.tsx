import { Environment } from "@react-three/drei";
import { EkkaEntity } from "../entities/ekka";
import { ExitEntity } from "../entities/exit";
import { LandEntity } from "../entities/land";
import { XRPlayerEntity } from "../entities/xr-player";

export function DebugLevel() {
  return (
    <>
      <Environment preset="night" />
      <color args={["#000000"]} attach="background" />
      <LandEntity>
        <mesh position={[0, -5.23, 11.3]} receiveShadow={true}>
          <boxGeometry args={[40, 10, 40]} />
          <meshStandardMaterial color="white" />
        </mesh>
      </LandEntity>
      <EkkaEntity position={[0, -43.18, -14.53]} scale={40} />
      <XRPlayerEntity position={[0, 0, 28]} />
      <ExitEntity position={[0, -0.25, 2.56]} />
      <ambientLight color="white" intensity={0.15} position={[0, 6.48, 8.98]} />
      <pointLight
        castShadow
        intensity={100}
        position={[0, 42.05, -2.95]}
        shadow-bias={0.0005}
      />
    </>
  );
}
