/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import { type FGEnvironment } from "@triplex/lib/types";
import * as vscode from "vscode";
import { version } from "../../package.json";
import * as output from "../util/log/vscode";
import { TriplexCodelensProvider } from "./codelens";
import { TriplexEditorProvider } from "./editor";

const log = output.logger("main");

export const subscriptions: vscode.Disposable[] = [];

export function activate(context: vscode.ExtensionContext) {
  const fgEnvironmentOverride: FGEnvironment =
    (process.env.FG_ENVIRONMENT_OVERRIDE as FGEnvironment) ||
    (process.env.NODE_ENV === "production" ? "production" : "development");

  context.subscriptions.push(
    TriplexCodelensProvider.register(),
    TriplexEditorProvider.register(context, { fgEnvironmentOverride }),
    output,
  );

  log.info(`Triplex for VS Code v${version} activated.`);
  log.info(`User ID: ${vscode.env.machineId}.`);
  log.info(`FG Env: ${fgEnvironmentOverride}.`);
}

export function deactivate() {
  return Promise.all(subscriptions.map((s) => s.dispose()));
}
