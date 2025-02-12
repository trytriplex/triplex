/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { RoundedBox } from "@react-three/drei";

export default function Scene() {
  return (
    <>
      <RoundedBox
        position={[0.283_739_024, -1.462_969_218_752_609_3, -0.887_002_380_509_703_6]}
        rotation={[
          2.153_373_887_542_495_7, -0.475_526_151_445_227_4, 0.226_807_893_351_223_42,
        ]}
      />
      <RoundedBox></RoundedBox>

      <RoundedBox
        position={[
          -2.813_889_551_893_372, 0.001_771_287_222_706_030_6, 2.132_940_941_397_735_4,
        ]}
        scale={[0.630_216_523_313_958, 0.630_216_523_313_957_7, 0.630_216_523_313_957_7]}
      />

      <RoundedBox
        position={[3, 0, 2]}
        rotation={[0, 0.25, 0]}
        scale={[1, 1.5, 1]}
      >
        <meshStandardMaterial color="purple" />
      </RoundedBox>
    </>
  );
}

export const Box = () => null;

export const Nested = () => (
  <>
    <RoundedBox
      position={[3, 0, 2]}
      rotation={[0, 0.25, 0]}
      scale={[1, 1.5, 1]}
    >
      <meshStandardMaterial color="purple" />
    </RoundedBox>
  </>
);

export function AddComponent() {
  return (
    <>
      <RoundedBox />
      <RoundedBox></RoundedBox>
    </>
  );
}
