/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { Straw } from "./components/straw";
import { Staging } from "./components/staging";
import { Glass } from "./components/glass";
import { Fork } from "./components/fork";
import { Flowers } from "./components/flowers";
import { Cake } from "./components/cake";
export function HelloWorld() {
  return (
    <>
      <Cake
        position={[-1.4590039717530734, 0, -0.3576449874121872]}
        rotation={[0, -0.39325811198764304, 0]}
      />
      <Flowers
        rotation={[0, -1.2955860306793092, 0]}
        position={[0.0912994365283617, 0, 0.9811895013593093]}
      />
      <Fork
        rotation={[0, 0, -0.6616965319293001]}
        position={[-0.7614707206303739, 0, -0.20217120775096564]}
      />
      <Glass
        rotation={[0, -1.148193656100133, 0]}
        position={[
          0.5176284386942649, -0.006309590780853528, -0.06200002514768754,
        ]}
      />
      <Staging />
      <Straw
        position={[
          0.5952588786725129, 0.19556286810199575, -0.1078226279637815,
        ]}
      />
    </>
  );
}
