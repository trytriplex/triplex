/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { Sky, SoftShadows } from "@react-three/drei";
import { Light } from "./components/light";
import {
  BackWall,
  CollectionOfCans,
  Floor,
  FloorPlanks,
  Lamps,
  Seat,
  SeatMats,
  Table,
  TableBox,
  Wall,
  WallpaperAndLights,
} from "./components/room";
import { Sphere } from "./components/sphere";

export function Room() {
  return (
    <>
      <SoftShadows samples={16} size={undefined} />
      <Sky inclination={0.52} />

      <Floor position={[0, 0.919_745_620_014_187_6, 0]} />

      <Wall position={[-6.601_040_957_040_237, 5.340_027_659_688_785, 0]} />

      <Wall
        position={[6.794_563_016_511_148, 5.341_597_526_161_233, 0]}
        scale={[-1, 1, 1]}
      />

      <BackWall
        position={[0, 5.373_038_841_701_562, -5.897_711_617_988_834_5]}
      />

      <Light />

      <ambientLight intensity={0.4} />

      <Table
        position={[
          0.377_654_235_171_633_1, 1.933_745_316_844_204_3,
          -0.868_450_176_273_028_6,
        ]}
      />

      <SeatMats
        position={[
          0.331_253_458_363_529_7, 1.651_381_401_048_803_3,
          -0.572_463_630_466_909_7,
        ]}
      />

      <TableBox
        position={[
          0.403_807_765_445_963_53, 2.757_960_398_852_471_2,
          -0.862_987_162_065_502_7,
        ]}
      />

      <CollectionOfCans
        position={[
          0.332_756_027_403_452_2, 2.985_181_889_657_092_7,
          -0.906_827_526_105_333_6,
        ]}
      />

      <Lamps position={[0, 2.370_600_692_653_582, -0.797_063_620_539_440_4]} />

      <FloorPlanks position={[0, 1.242_420_696_469_540_1, 0]} />

      <WallpaperAndLights
        position={[0, 5.416_529_827_741_108, -3.159_583_852_938_044_2]}
      />

      <Seat
        position={[
          -2.405_981_291_439_809_3, 2.536_032_828_363_932_6,
          -0.872_611_004_660_722_2,
        ]}
      />

      <Seat
        position={[
          0.328_789_715_681_980_57, 2.435_747_241_478_875_2,
          2.106_621_952_340_723_2,
        ]}
        rotation={[
          -3.141_592_653_589_792_7, 1.563_143_060_010_577,
          3.141_592_653_589_793,
        ]}
      />

      <Sphere
        position={[
          -1.345_590_595_660_806_3, 1.491_518_001_914_535_3,
          -8.116_668_133_155_024,
        ]}
        speed={3}
      />

      <Sphere
        position={[
          2.882_027_173_731_192, 2.251_990_123_907_609, -13.340_406_808_224_275,
        ]}
        speed={1}
      />
      <Sphere
        position={[
          3.032_222_532_462_284, 0.225_875_180_190_899_14,
          -10.816_753_601_686_415,
        ]}
        speed={3}
      />

      <Seat
        position={[
          3.068_071_464_648_008_7, 2.467_385_535_492_958_6,
          -0.987_337_519_562_908_2,
        ]}
        rotation={[
          -3.141_592_653_589_793, 0.056_617_659_531_657_1,
          -3.141_592_653_589_793,
        ]}
      />

      <Seat
        position={[
          0.263_841_363_015_422_8, 2.435_664_955_905_709_7,
          -3.279_324_835_800_52,
        ]}
        rotation={[0, -1.557_901_130_444_500_5, 0]}
      />
    </>
  );
}
