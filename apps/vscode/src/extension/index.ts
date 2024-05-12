/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */

import type * as vscode from "vscode";
import { TriplexCodelensProvider } from "./codelens";
import { TriplexEditorProvider } from "./editor";

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    TriplexCodelensProvider.register(),
    TriplexEditorProvider.register(context)
  );
}

export function deactivate() {}
