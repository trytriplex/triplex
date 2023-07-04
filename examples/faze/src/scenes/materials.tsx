/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { CascadedShadowMap } from "../utils/cascaded-shadow-map";
import { MathUtils } from "three";
import { WaterMaterial } from "../materials/water";
import { Tree } from "../meshes/tree";

export function MaterialsScene() {
  return (
    <>
      <mesh
        name="ground"
        rotation={[MathUtils.degToRad(-90), 0, 0]}
        receiveShadow
        position={[7.434537952443046, -0.8352476302767253, -4.0473018380238575]}
      >
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="white" />
      </mesh>

      <mesh receiveShadow castShadow position={[0, 2, -5]}>
        <boxGeometry args={[10, 1, 10, 10, 1, 10]} />
        <WaterMaterial wavelength={50} speed={10} />
      </mesh>

      <Tree position={[7.076076783648794, 0, 2.4649270656044013]} />

      <group position={[15, 0, 0]}>
        <Tree position={[0, 0, 0]} />
        <Tree position={[2, 0, -3.5]} />
        <Tree position={[-2, 0, -7]} />
        <Tree position={[-4, 0, -3]} />
      </group>

      <hemisphereLight color="#87CEEB" intensity={0.3} groundColor="#362907" />
      <ambientLight intensity={0.3} />
      <directionalLight position={[2.5, 8, 5]} intensity={0.5} />
      <pointLight position={[-10, 0, -20]} color="#eef4aa" intensity={0.5} />
      <CascadedShadowMap />
    </>
  );
}
