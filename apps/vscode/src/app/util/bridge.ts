/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { on, type ClientSendEventData } from "@triplex/bridge/host";

declare global {
  interface Window {
    acquireVsCodeApi: () => {
      postMessage: (data: unknown) => void;
    };
  }
}

export const vscode = window.acquireVsCodeApi();

export interface FromVSCodeEvent {
  "vscode:play-camera": {
    name: "default" | "editor";
  };
  "vscode:request-blur-element": void;
  "vscode:request-delete-element":
    | {
        column: number;
        line: number;
        path: string;
      }
    | undefined;
  "vscode:request-duplicate-element":
    | {
        column: number;
        line: number;
        path: string;
      }
    | undefined;
  "vscode:request-focus-element": {
    column: number;
    line: number;
    path: string;
  };
  "vscode:request-jump-to-element":
    | {
        column: number;
        line: number;
        path: string;
      }
    | undefined;
  "vscode:request-open-component": {
    exportName: string;
    path: string;
  };
  "vscode:request-refresh-scene": undefined;
  "vscode:request-reload-scene": undefined;
  "vscode:state-change": { active: boolean };
}

export interface ToVSCodeEvent extends ClientSendEventData {
  "element-delete": {
    column: number;
    line: number;
    path: string;
  };
  "element-duplicate": {
    column: number;
    line: number;
    path: string;
  };
  notification: {
    actions: string[];
    message: string;
    type: "info" | "warning" | "error";
  };
}

/**
 * Receives a message from the parent VSCode extension. Should be used in the
 * VSCE webview.
 */
export function onVSCE<TEvent extends keyof FromVSCodeEvent>(
  eventName: TEvent,
  callback: (data: FromVSCodeEvent[TEvent]) => void,
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

export function sendVSCE<TEvent extends keyof ToVSCodeEvent>(
  eventName: TEvent,
  data: ToVSCodeEvent[TEvent],
) {
  vscode.postMessage({ data, eventName });
}

export function forwardClientMessages(eventName: keyof ClientSendEventData) {
  return on(eventName, (data) => {
    vscode.postMessage({ data, eventName });
  });
}
