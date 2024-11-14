/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
export function draggableNumberInputContextMenuFix() {
  const callback = (event: MouseEvent) => {
    if (
      event.target instanceof HTMLInputElement &&
      event.target.tagName === "INPUT" &&
      event.target.type === "number" &&
      event.ctrlKey
    ) {
      event.stopImmediatePropagation();
    }
  };

  window.addEventListener("contextmenu", callback, true);

  return () => {
    window.removeEventListener("contextmenu", callback, true);
  };
}
