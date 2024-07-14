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

export type Accelerator = Keys | `${Modifiers}+${Keys}`;

function parseAccelerator(accelerator: Accelerator) {
  if (accelerator.includes("+")) {
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
