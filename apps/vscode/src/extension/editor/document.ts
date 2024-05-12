/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import type * as vscode from "vscode";

export class TriplexDocument implements vscode.CustomDocument {
  get uri() {
    return this._uri;
  }

  constructor(private readonly _uri: vscode.Uri) {}

  async backup(
    _context: vscode.CustomDocumentBackupContext,
    _cancellation: vscode.CancellationToken
  ): Promise<vscode.CustomDocumentBackup> {
    return {
      delete() {},
      id: "",
    };
  }

  async save(_cancellation: vscode.CancellationToken) {}

  async saveAs(
    _destination: vscode.Uri,
    _cancellation: vscode.CancellationToken
  ) {}

  async revert(_cancellation: vscode.CancellationToken) {}

  dispose(): void {}
}
