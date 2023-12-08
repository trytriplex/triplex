/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { type Vector3Tuple } from "three";
import Sphere from "./geometry/sphere";

export function Box({ position }: { position?: Vector3Tuple }) {
  return (
    <group>
      <RigidBody
        canSleep={false}
        colliders={"hull"}
        name="box"
        position={position}
        type="dynamic"
      >
        <mesh
          castShadow={true}
          position={[
            1.654_992_012_612_143_3, -0.325_433_428_480_874_2,
            -0.274_496_932_194_292_6,
          ]}
          receiveShadow={true}
          rotation={[0, 0, -1.570_796_326_794_896_6]}
          scale={[
            0.904_516_762_434_190_5, 0.319_770_360_905_584,
            2.396_496_829_171_177,
          ]}
        >
          <boxGeometry />
          <meshStandardMaterial />
        </mesh>

        <mesh
          castShadow={true}
          position={[
            0.047_143_287_639_252_91, -0.325_433_428_480_874_2,
            -1.500_229_479_128_919_2,
          ]}
          receiveShadow={true}
          rotation={[0, -1.570_796_326_794_896_6, -1.570_796_326_794_896_6]}
          scale={[
            0.904_516_762_434_190_5, 0.319_770_360_905_584,
            3.525_112_170_622_185_7,
          ]}
        >
          <boxGeometry />
          <meshStandardMaterial />
        </mesh>

        <mesh
          castShadow={true}
          position={[
            0.047_143_287_639_252_91, -0.325_433_428_480_874_2,
            1.040_137_774_455_759_2,
          ]}
          receiveShadow={true}
          rotation={[0, -1.570_796_326_794_896_6, -1.570_796_326_794_896_6]}
          scale={[
            0.904_516_762_434_190_5, 0.319_770_360_905_584,
            3.525_112_170_622_185_7,
          ]}
        >
          <boxGeometry />
          <meshStandardMaterial />
        </mesh>

        <mesh
          castShadow={true}
          position={[
            -1.550_614_746_238_744, -0.325_433_428_480_874_2,
            -0.274_496_932_194_292_6,
          ]}
          receiveShadow={true}
          rotation={[0, 0, -1.570_796_326_794_896_6]}
          scale={[
            0.904_516_762_434_190_5, 0.319_770_360_905_584,
            2.396_496_829_171_177,
          ]}
        >
          <boxGeometry />
          <meshStandardMaterial />
        </mesh>

        <mesh
          position={[
            0.031_562_394_098_517_244, -0.616_664_139_396_894_6,
            -0.274_496_932_194_292_6,
          ]}
          receiveShadow={true}
          scale={[
            2.981_527_080_794_196, 0.319_770_360_905_584, 2.396_496_829_171_177,
          ]}
        >
          <boxGeometry />
          <meshStandardMaterial />
        </mesh>
      </RigidBody>
    </group>
  );
}

export function Physics() {
  return (
    <>
      <CuboidCollider
        args={[10, 1, 10]}
        position={[
          1.923_547_198_662_539_9, -1.425_786_335_514_172,
          -0.925_081_694_388_665_5,
        ]}
      />

      <Sphere
        position={[-0.782_081_715_452_837_4, 0, 0]}
        scale={[
          0.386_257_404_064_349_94, 0.386_257_404_064_349_94,
          0.386_257_404_064_349_94,
        ]}
      />
      <Sphere
        position={[-0.396_013_893_063_938_1, 0, -0.687_283_892_702_815_6]}
        scale={[
          0.386_257_404_064_349_94, 0.386_257_404_064_349_94,
          0.386_257_404_064_349_94,
        ]}
      />
      <Sphere
        position={[
          -0.170_716_355_358_459_86, 2.478_798_691_809_955_4,
          0.116_898_874_730_736_68,
        ]}
        scale={[
          0.386_257_404_064_349_94, 0.386_257_404_064_349_94,
          0.386_257_404_064_349_94,
        ]}
      />
      <Sphere
        position={[
          0.813_891_305_449_321_1, -0.003_901_889_245_262_517,
          0.069_540_835_700_253_89,
        ]}
        scale={[
          0.386_257_404_064_349_94, 0.386_257_404_064_349_94,
          0.386_257_404_064_349_94,
        ]}
      />
      <Sphere
        position={[
          -0.595_030_898_522_424_2, 0.000_576_974_211_709_756_5,
          0.009_297_507_839_831_534,
        ]}
        scale={[
          0.386_257_404_064_349_94, 0.386_257_404_064_349_94,
          0.386_257_404_064_349_94,
        ]}
      />

      <Box
        position={[
          -0.491_003_160_160_046_64, 0.351_305_484_771_728_5,
          0.000_168_684_642_878_531_58,
        ]}
      />
      <pointLight
        castShadow={true}
        intensity={0.5}
        position={[
          0.979_331_023_909_911_6, 1.007_547_261_817_082_7,
          -2.376_683_818_593_280_6,
        ]}
      />
      <ambientLight intensity={0.1} />
      <pointLight
        castShadow={true}
        intensity={0.2}
        position={[
          -1.847_352_227_162_117_4, 1.764_152_076_464_903,
          2.012_114_155_048_759_6,
        ]}
      />
    </>
  );
}
