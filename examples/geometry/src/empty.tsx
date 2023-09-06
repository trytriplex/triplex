/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { Gltf } from "@react-three/drei";
import { forwardRef, memo } from "react";
import { useProvider } from "./provider";

const WhiteBox = forwardRef(() => (
  <>
    <group
      position={[1.9086648049886241, 0.04572838022181329, -0.688279655460336]}
      scale={[1, 1, 1]}
      rotation={[10, 0, 0, "XYZ"]}
    >
      <mesh
        position={[
          1.9086648049886241, 0.04572838022181329, 0.39765303595505175,
        ]}
        scale={[1, 1, 1]}
        rotation={[-1.7524068513792561, 0.10591308637924984, 0.833266430489208]}
      >
        <boxGeometry args={[1, 1, 1]} />
      </mesh>
    </group>
  </>
));

export const AnotherBox = memo(() => {
  useProvider();

  return (
    <>
      <mesh visible={true} rotation={[0, 0, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="pink" />
      </mesh>
    </>
  );
});

export function Empty() {
  useProvider();

  return (
    <>
      <mesh
        position={[-0.8747332311659066, 0, 0]}
        rotation={[0, 0, -0.5833472919033484]}
        scale={[2.4353118252497836, 2.4353118252497836, 2.4353118252497836]}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="pink" />
      </mesh>
      <pointLight
        position={[-1.9975799090485649, 2.588841540204465, 2.6706718717036817]}
      />
    </>
  );
}

export default WhiteBox;

export function Untitled() {
  useProvider();

  return (
    <>
      <Gltf src="/assets/pmndrs.glb" />
      <ambientLight intensity={0.2} />
      <pointLight
        position={[3.6061279737327556, 4.738121655802967, 2.498021229073046]}
        color={"#f57a7a"}
      />
    </>
  );
}
