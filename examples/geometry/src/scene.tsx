/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import Cylinder from "@/geometry/cylinder";
import { PerspectiveCamera, RoundedBox } from "@react-three/drei";
import Box from "src/geometry/box";
import Box1 from "./geometry/box";
import Sphere from "./geometry/sphere";
import { ThisSpreadProps } from "./geometry/spread";

export function SceneAlt() {
  return (
    <>
      <Box
        position={[
          -0.488_684_373_401_574_45, 0.596_586_729_407_292_8,
          1.311_273_188_113_876,
        ]}
      />
      <ThisSpreadProps
        position={[-4.740_835_822_745_279, 0, -3.280_281_099_034_365]}
      />
    </>
  );
}

export default function Scene() {
  return (
    <>
      <SceneAlt />
      <Box
        color={undefined}
        position={[
          0.283_739_024_617_604_6, -1.462_969_218_752_609_3,
          -0.887_002_380_509_703_6,
        ]}
        rotation={[
          2.153_373_887_542_495_7, -0.475_526_151_445_227_4,
          0.226_807_893_351_223_42,
        ]}
        scale={[1, 1, 1.977_327_619_564_505]}
      />
      <Cylinder
        position={[-1.566_394_995_899_318, 0, -3.722_001_701_154_086_5]}
      ></Cylinder>

      <Sphere
        position={[
          -2.813_889_551_893_372, 0.001_771_287_222_706_030_6,
          2.132_940_941_397_735_4,
        ]}
        scale={[
          0.630_216_523_313_958, 0.630_216_523_313_957_7,
          0.630_216_523_313_957_7,
        ]}
      />

      <RoundedBox
        position={[3, 0, 2]}
        rotation={[0, 0.25, 0]}
        scale={[1, 1.5, 1]}
        visible={undefined}
      >
        <meshStandardMaterial color="purple" opacity={0} />
      </RoundedBox>

      <Cylinder
        position={[1.468_146_486_913_723_5, 0, -4.205_778_397_787_599]}
      />
      <Cylinder
        position={[-5.147_492_724_511_15, 0, -2.961_833_087_171_181_8]}
      />
      <Box1 color={"blue"} position={1} size={1} />
      <PerspectiveCamera
        makeDefault
        name="user-perspective"
        position={[0, 0.626_117_094_241_069_5, -0.098_171_272_378_962_73]}
        rotation={[-0.191_986_217_719_376_24, -0.002_030_757_867_083_124, 0]}
        scale={[1, 1, 1]}
        zoom={1}
      />
    </>
  );
}
