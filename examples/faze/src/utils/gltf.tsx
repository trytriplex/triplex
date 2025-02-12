/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { useGLTF as useDreiGLTF } from "@react-three/drei";
import { type Object3D } from "three";
import { type GLTF } from "three-stdlib";

export function useGLTF<TNodes extends string = never>(path: string) {
  type GLTFExtend = GLTF & { nodes: Record<TNodes, Object3D> };

  return useDreiGLTF(path) as never as GLTFExtend;
}
