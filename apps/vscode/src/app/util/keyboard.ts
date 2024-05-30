/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
export function onKeyDown(
  key: KeyboardEvent["key"],
  cb: (e: KeyboardEvent) => void
) {
  const callback = (e: KeyboardEvent) => {
    if (e.key === key) {
      cb(e);
    }
  };

  window.addEventListener("keydown", callback);

  return () => window.removeEventListener("keydown", callback);
}
