/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { type ClientSendEventData } from "@triplex/bridge/host";
import type * as vscode from "vscode";
import { type VSCodeEvent } from "../../app/util/bridge";

/**
 * Sends a message to the webview extension.
 */
export function sendVSCE<TEventName extends keyof VSCodeEvent>(
  webview: vscode.Webview,
  eventName: TEventName,
  data: VSCodeEvent[TEventName]
) {
  webview.postMessage({
    data,
    eventName,
  });
}

export function on<TEventName extends keyof ClientSendEventData>(
  webview: vscode.Webview,
  eventName: TEventName,
  cb: (data: ClientSendEventData[TEventName]) => void
) {
  const disposable = webview.onDidReceiveMessage((e) => {
    if (
      typeof e === "object" &&
      "eventName" in e &&
      e.eventName === eventName
    ) {
      cb(e.data);
    }
  });

  return () => disposable.dispose();
}
