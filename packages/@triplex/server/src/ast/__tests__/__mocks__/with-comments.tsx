/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
export default function WithComments() {
  return (
    // Hello there
    <mesh visible>
      <boxGeometry />
    </mesh>
    // Oh no!
  );
}

export function AnotherOne() {
  return (
    // OK
    <mesh castShadow={false} visible={true} />
  );
}
