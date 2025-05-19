import { XROrigin } from "@react-three/xr";

export function Scene() {
  return (
    <>
      <XROrigin />

      <mesh position={[0, 0, -2.74]}>
        <boxGeometry />
      </mesh>
    </>
  );
}
