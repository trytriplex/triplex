/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */

export function Inbuilt() {
  return (
    <mesh>
      <boxGeometry />
    </mesh>
  );
}
export function Inbuilt1() {
  return <Inbuilt />;
}

export function Inbuilt2() {
  return <Inbuilt1 />;
}

export function Scene() {
  return (
    <>
      <Inbuilt2 />
    </>
  );
}
