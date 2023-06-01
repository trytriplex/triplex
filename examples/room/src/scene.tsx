import { SoftShadows, Sky } from "@react-three/drei";

export function Room() {
  return (
    <>
      <SoftShadows samples={16} size={undefined} />
      <Sky inclination={0.52} />
    </>
  );
}
