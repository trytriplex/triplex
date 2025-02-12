/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import * as vscode from "vscode";
import { version } from "../../package.json";
import * as output from "../util/log/vscode";
import { TriplexCodelensProvider } from "./codelens";
import { TriplexEditorProvider } from "./editor";

const log = output.logger("main");

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    TriplexCodelensProvider.register(),
    TriplexEditorProvider.register(context),
    output,
  );

  log.info(`Triplex for VS Code v${version} activated.`);
  log.debug(`User ID: ${vscode.env.machineId}.`);
  log.debug(`FG Env: ${process.env.FG_ENVIRONMENT_OVERRIDE || "production"}.`);
}

export function deactivate() {}
