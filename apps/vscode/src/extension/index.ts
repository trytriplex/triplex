/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
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
