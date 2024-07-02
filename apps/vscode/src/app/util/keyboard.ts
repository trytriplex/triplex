/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
const assignedKeys: string[] = [];

const inputTags = [
  "CHECKBOX",
  "DROPDOWN",
  "INPUT",
  "SELECT",
  "TEXT-FIELD",
  "TEXTAREA",
];

export function onKeyDown(
  key: KeyboardEvent["key"],
  cb: (e: KeyboardEvent) => void,
) {
  if (assignedKeys.includes(key)) {
    throw new Error(`invariant: "${key}" key already assigned`);
  }

  const callback = (e: KeyboardEvent) => {
    if (
      e.key === key &&
      e.metaKey === false &&
      e.ctrlKey === false &&
      e.altKey === false &&
      e.shiftKey === false &&
      !(
        document.activeElement &&
        inputTags.some((tag) => document.activeElement?.tagName.includes(tag))
      )
    ) {
      cb(e);
    }
  };

  window.addEventListener("keydown", callback);

  return () => {
    assignedKeys.splice(assignedKeys.indexOf(key), 1);
    window.removeEventListener("keydown", callback);
  };
}
