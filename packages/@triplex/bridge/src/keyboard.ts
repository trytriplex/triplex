/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
export interface KeyboardEventObject {
  altKey: boolean;
  code: string;
  ctrlKey: boolean;
  isComposing: boolean;
  key: string;
  keyCode: number;
  location: number;
  metaKey: boolean;
  repeat: boolean;
  shiftKey: boolean;
}

export type KeyboardEvents = "keydown" | "keyup";

export function createKeyboardEventForwarder(
  callback: (eventName: KeyboardEvents, data: KeyboardEventObject) => void,
) {
  function createCallback(eventName: KeyboardEvents) {
    return (e: KeyboardEvent) => {
      if (e.target === e.currentTarget) {
        // This event is a synthetic event so we skip forwarding it.
        return;
      }

      callback(eventName, {
        altKey: e.altKey,
        code: e.code,
        ctrlKey: e.ctrlKey,
        isComposing: e.isComposing,
        key: e.key,
        keyCode: e.keyCode, // keyCode is needed for Windows support.
        location: e.location,
        metaKey: e.metaKey,
        repeat: e.repeat,
        shiftKey: e.shiftKey,
      });
    };
  }

  const keydown = createCallback("keydown");
  const keyup = createCallback("keyup");

  document.addEventListener("keydown", keydown);
  document.addEventListener("keyup", keyup);

  return () => {
    document.removeEventListener("keydown", keydown);
    document.removeEventListener("keyup", keyup);
  };
}
