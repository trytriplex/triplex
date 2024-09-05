/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { Scroll, ScrollControls, useScroll } from "@react-three/drei";

function ThrowWhenUndefined() {
  const scroll = useScroll();
  if (!scroll) {
    throw new Error("invariant: scroll was not found");
  }

  return null;
}

export function ScrollTestFixture() {
  return (
    <>
      <ScrollControls pages={3}>
        <ThrowWhenUndefined />
        <Scroll>
          <mesh>
            <boxGeometry />
          </mesh>
        </Scroll>
      </ScrollControls>
    </>
  );
}
