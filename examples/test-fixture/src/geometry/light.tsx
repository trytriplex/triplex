/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import Box from "./box";

export function Light() {
  return (
    <>
      <Box position={[0, 16.06, 55.96]} scale={0.1} />
      <ambientLight position={[0, 1.66, 5.76]} />
    </>
  );
}
