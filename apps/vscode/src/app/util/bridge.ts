/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
export interface VSCodeEvent {
  "vscode:request-open-component": {
    exportName: string;
    path: string;
  };
}

/**
 * Receives a message from the parent VSCode extension. Should be used in the
 * VSCE webview.
 */
export function onVSCE<TEvent extends keyof VSCodeEvent>(
  eventName: TEvent,
  callback: (data: VSCodeEvent[TEvent]) => void
) {
  const cb = async (e: MessageEvent) => {
    if (typeof e.data === "object" && e.data.eventName === eventName) {
      callback(e.data.data);
    }
  };

  window.addEventListener("message", cb);

  return () => {
    window.removeEventListener("message", cb);
  };
}
