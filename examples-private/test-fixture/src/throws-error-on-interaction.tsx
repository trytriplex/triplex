/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { throwsError } from "./util/errors";

export function ErrorsDuringInteraction() {
  return (
    <mesh onClick={() => throwsError("Throwing an error on interaction.")}>
      <boxGeometry />
    </mesh>
  );
}
