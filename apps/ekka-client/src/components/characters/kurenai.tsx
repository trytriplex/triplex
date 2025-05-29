import { useGLTF } from "@react-three/drei";
import { MathUtils } from "three";

export function Kurenai() {
  const { scene } = useGLTF("/assets/kurenai.glb");

  return (
    <primitive object={scene} rotation={[0, MathUtils.degToRad(180), 0]} />
  );
}
