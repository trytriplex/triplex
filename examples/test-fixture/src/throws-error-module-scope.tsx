/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { throwsError } from "./util/errors";

// When starting Triplex and then commenting out this line of code the editor
// doesn't recover — forcing you to restart the editor. Vite doesn't trigger any
// HMR events when the file is updated. Is this a bug?
throwsError("Throwing an error during module initialization.");

export function ErrorsDuringModuleInit() {
  return (
    <mesh>
      <boxGeometry />
    </mesh>
  );
}
