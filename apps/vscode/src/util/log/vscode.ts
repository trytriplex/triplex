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
  const buildLog = (...msg: unknown[]) => `[${scope}] ` + msg.join(" ");

  const log = (...msg: unknown[]) => {
    outputChannel.info(buildLog(msg));
  };

  log.error = (...msg: unknown[]) => {
    outputChannel.error(buildLog(msg));
  };

  log.debug = (...msg: unknown[]) => {
    outputChannel.debug(buildLog(msg));
  };

  log.info = (...msg: unknown[]) => {
    outputChannel.info(buildLog(msg));
  };

  return log;
}

export function dispose() {
  outputChannel.dispose();
}
