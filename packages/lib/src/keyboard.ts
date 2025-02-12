/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
const assignedKeys: string[] = [];
const excludedKeys = ["Escape", "Enter"];

const inputTags = [
  "CHECKBOX",
  "DROPDOWN",
  "INPUT",
  "SELECT",
  "TEXT-FIELD",
  "TEXTAREA",
];

type Modifiers = "CommandOrCtrl" | "Shift";
type Keys =
  | "Backspace"
  | "Escape"
  | "A"
  | "B"
  | "C"
  | "D"
  | "E"
  | "F"
  | "G"
  | "H"
  | "I"
  | "J"
  | "K"
  | "L"
  | "M"
  | "N"
  | "O"
  | "P"
  | "Q"
  | "R"
  | "S"
  | "T"
  | "U"
  | "V"
  | "W"
  | "X"
  | "Y"
  | "Z";

export type Accelerator =
  | Keys
  | `${Modifiers}+${Keys}`
  | `CommandOrCtrl+Shift+${Keys}`;

function parseAccelerator(accelerator: Accelerator) {
  if (accelerator.includes("CommandOrCtrl+Shift+")) {
    const [, , key] = accelerator.split("+");
    const parsedKey = key.length === 1 ? key.toLowerCase() : key;
    const isWindows = navigator.userAgent.includes("Windows");

    return {
      ctrl: isWindows,
      key: parsedKey,
      meta: !isWindows,
      shift: true,
    };
  } else if (accelerator.includes("+")) {
    const [modifier, key] = accelerator.split("+");
    const parsedKey = key.length === 1 ? key.toLowerCase() : key;
    const isWindows = navigator.userAgent.includes("Windows");

    return {
      ctrl: isWindows && modifier === "CommandOrCtrl",
      key: parsedKey,
      meta: !isWindows && modifier === "CommandOrCtrl",
      shift: modifier === "Shift",
    };
  } else {
    const parsedKey =
      accelerator.length === 1 ? accelerator.toLowerCase() : accelerator;

    return {
      ctrl: false,
      key: parsedKey,
      meta: false,
      shift: false,
    };
  }
}

export function onKeyDown(
  accelerator: Accelerator,
  cb: (e: KeyboardEvent) => void,
) {
  const parsed = parseAccelerator(accelerator);
  if (assignedKeys.includes(accelerator)) {
    throw new Error(`invariant: "${accelerator}" key already assigned`);
  }

  const callback = (e: KeyboardEvent) => {
    if (
      e.key === parsed.key &&
      e.metaKey === parsed.meta &&
      e.ctrlKey === parsed.ctrl &&
      e.altKey === false &&
      e.shiftKey === parsed.shift &&
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
    assignedKeys.splice(assignedKeys.indexOf(accelerator), 1);
    window.removeEventListener("keydown", callback);
  };
}

/**
 * This prevents VS Code from handling keyboard shortcuts when an input is
 * focused. Any key down events that are have modifiers are allowed to
 * propagate.
 */
export function blockInputPropagation() {
  const callback = (e: KeyboardEvent) => {
    const activeElement = document.activeElement;

    if (
      activeElement &&
      e.metaKey === false &&
      e.ctrlKey === false &&
      e.altKey === false &&
      e.shiftKey === false &&
      excludedKeys.includes(e.key) === false &&
      inputTags.some((tag) => activeElement.tagName.includes(tag))
    ) {
      e.stopPropagation();
    }
  };

  window.addEventListener("keydown", callback, true);

  return () => {
    window.removeEventListener("keydown", callback, true);
  };
}
