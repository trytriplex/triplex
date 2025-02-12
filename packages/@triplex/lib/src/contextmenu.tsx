/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
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
