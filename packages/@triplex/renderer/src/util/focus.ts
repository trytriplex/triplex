/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { bindAll } from "bind-event-listener";

/**
 * Simple method of blocking children of an element from being focused. It
 * doesn't handle proper edge cases of skipping tab stops so all the tab stops
 * will still be functional, they just won't ever be focused.
 *
 * In the future we need to make this more robust and handle all edge cases.
 */
export function blockFocusableChildren(element: HTMLElement) {
  const cleanupElementEvents = bindAll(element, [
    {
      listener: (e) => {
        if (e.target instanceof HTMLElement) {
          e.target.blur();
        }
      },
      options: { capture: true },
      type: "focusin",
    },
  ]);

  return () => {
    cleanupElementEvents();
  };
}
