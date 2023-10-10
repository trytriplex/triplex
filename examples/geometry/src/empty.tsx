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
      position={[
        1.908_664_804_988_624_1, 0.045_728_380_221_813_29,
        -0.688_279_655_460_336,
      ]}
      rotation={[10, 0, 0, "XYZ"]}
      scale={[1, 1, 1]}
    >
      <mesh
        position={[
          1.908_664_804_988_624_1, 0.045_728_380_221_813_29,
          0.397_653_035_955_051_75,
        ]}
        rotation={[
          -1.752_406_851_379_256_1, 0.105_913_086_379_249_84,
          0.833_266_430_489_208,
        ]}
        scale={[1, 1, 1]}
      >
        <boxGeometry args={[1, 1, 1]} />
      </mesh>
    </group>
  </>
));

WhiteBox.displayName = "WhiteBox";

export const AnotherBox = memo(() => {
  useProvider();

  return (
    <>
      <mesh rotation={[0, 0, 0]} visible={true}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="pink" />
      </mesh>
    </>
  );
});

AnotherBox.displayName = "AnotherBox";

export function Empty() {
  useProvider();

  return (
    <>
      <mesh
        position={[-0.874_733_231_165_906_6, 0, 0]}
        rotation={[0, 0, -0.583_347_291_903_348_4]}
        scale={[
          2.435_311_825_249_783_6, 2.435_311_825_249_783_6,
          2.435_311_825_249_783_6,
        ]}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="pink" />
      </mesh>
      <pointLight
        position={[
          -1.997_579_909_048_564_9, 2.588_841_540_204_465,
          2.670_671_871_703_681_7,
        ]}
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
        color={"#f57a7a"}
        position={[
          3.606_127_973_732_755_6, 4.738_121_655_802_967, 2.498_021_229_073_046,
        ]}
      />
    </>
  );
}
