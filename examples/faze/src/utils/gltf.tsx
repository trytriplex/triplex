import { Object3D } from "three";
import { GLTF } from "three-stdlib";
import { useGLTF as useDreiGLTF } from "@react-three/drei";

export function useGLTF<TNodes extends string = never>(path: string) {
  type GLTFExtend = GLTF & { nodes: Record<TNodes, Object3D> };

  return useDreiGLTF(path) as never as GLTFExtend;
}
