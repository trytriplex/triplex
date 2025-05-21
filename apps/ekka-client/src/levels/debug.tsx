import { EkkaEntity } from "../entities/ekka";
import { ExitEntity } from "../entities/exit";
import { LandEntity } from "../entities/land";
import { XRPlayerEntity } from "../entities/xr-player";

export function DebugLevel() {
  return (
    <>
      <LandEntity>
        <mesh position={[0, 0, -5]}>
          <boxGeometry args={[5, 0.02, 10]} />
          <meshStandardMaterial />
        </mesh>
      </LandEntity>
      <EkkaEntity position={[0, -0.45, -10.65]} />
      <XRPlayerEntity />
      <ExitEntity position={[0, 0, -9.95]} />
    </>
  );
}
