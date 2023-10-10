/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { Cake } from "./components/cake";
import { Flowers } from "./components/flowers";
import { Fork } from "./components/fork";
import { Glass } from "./components/glass";
import { Staging } from "./components/staging";
import { Straw } from "./components/straw";

export function HelloWorld() {
  return (
    <>
      <Cake
        position={[-1.459_003_971_753_073_4, 0, -0.357_644_987_412_187_2]}
        rotation={[0, -0.393_258_111_987_643_04, 0]}
      />
      <Flowers
        position={[0.091_299_436_528_361_7, 0, 0.981_189_501_359_309_3]}
        rotation={[0, -1.295_586_030_679_309_2, 0]}
      />
      <Fork
        position={[-0.761_470_720_630_373_9, 0, -0.202_171_207_750_965_64]}
        rotation={[0, 0, -0.661_696_531_929_300_1]}
      />
      <Glass
        position={[
          0.517_628_438_694_264_9, -0.006_309_590_780_853_528,
          -0.062_000_025_147_687_54,
        ]}
        rotation={[0, -1.148_193_656_100_133, 0]}
      />
      <Staging />
      <Straw
        position={[
          0.595_258_878_672_512_9, 0.195_562_868_101_995_75,
          -0.107_822_627_963_781_5,
        ]}
      />
    </>
  );
}
