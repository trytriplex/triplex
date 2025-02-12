/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
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
