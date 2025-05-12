import { Gltf } from "@react-three/drei";
import asset from "../public/assets/pmndrs.glb";

export function LoadFromPublic() {
  return (
    <>
      <Gltf src={asset} />
    </>
  );
}
