/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */

import { init } from "@sentry/node";
import * as vscode from "vscode";
import { version } from "../../package.json";
import * as output from "../util/log/vscode";
import { TriplexCodelensProvider } from "./codelens";
import { TriplexEditorProvider } from "./editor";

if (process.env.NODE_ENV === "production" && vscode.env.isTelemetryEnabled) {
  init({
    dsn: "https://cae61a2a840cbbe7f17e240c99ad0346@o4507990276177920.ingest.us.sentry.io/4507990321725440",
  });
}

const log = output.logger("main");

export function activate(context: vscode.ExtensionContext) {
  log(`Triplex for VS Code v${version} activating...`);

  context.subscriptions.push(
    TriplexCodelensProvider.register(),
    TriplexEditorProvider.register(context),
    output,
  );

  log(`Activated.`);
}

export function deactivate() {}
