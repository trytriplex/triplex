/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { useGLTF as useDreiGLTF } from "@react-three/drei";
import { Object3D } from "three";
import { GLTF } from "three-stdlib";

export function useGLTF<TNodes extends string = never>(path: string) {
  type GLTFExtend = GLTF & { nodes: Record<TNodes, Object3D> };

  return useDreiGLTF(path) as never as GLTFExtend;
}
