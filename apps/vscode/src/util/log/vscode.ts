/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import * as vscode from "vscode";

const outputChannel = vscode.window.createOutputChannel("Triplex", {
  log: true,
});

export function logger(scope: string) {
  return (...msg: unknown[]) => {
    outputChannel.appendLine(`[${scope}] ` + msg.join(" "));
  };
}

export function dispose() {
  outputChannel.dispose();
}
