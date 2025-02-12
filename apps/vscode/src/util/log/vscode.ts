/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { type ChildProcess } from "node:child_process";
import * as vscode from "vscode";

const outputChannel = vscode.window.createOutputChannel("Triplex", {
  log: true,
});

const buildLog = (scope: string, msg: unknown[]) =>
  `[${scope}] ` + msg.filter(Boolean).join(" ");

export function logger(scope: string) {
  return {
    debug: (...msg: unknown[]) => {
      outputChannel.debug(buildLog(scope, msg));
    },
    error: (...msg: unknown[]) => {
      outputChannel.error(buildLog(scope, msg));
    },
    info: (...msg: unknown[]) => {
      outputChannel.info(buildLog(scope, msg));
    },
  };
}

export function logFromFork(process: ChildProcess) {
  process.on("message", (e) => {
    const eventObject = e as {
      log?: {
        message: string[];
        scope: string;
        type: "debug" | "error" | "info";
      };
    };

    if (eventObject.log) {
      const { message, scope, type } = eventObject.log;

      switch (type) {
        case "debug":
          outputChannel.debug(buildLog(scope, message));
          break;

        case "error":
          outputChannel.error(buildLog(scope, message));
          break;

        case "info":
          outputChannel.info(buildLog(scope, message));
          break;
      }
    }
  });
}

export function dispose() {
  outputChannel.dispose();
}
