/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import * as vscode from "vscode";

function toJSONString(value: unknown): string {
  const str = JSON.stringify(value, (_k, v) =>
    v === undefined ? "__UNDEFINED__" : v,
  );

  return str.replaceAll('"__UNDEFINED__"', "undefined");
}

export class TriplexDocument implements vscode.CustomDocument {
  private _onDidChange = new vscode.EventEmitter<{
    label: string;
    redo(): void;
    undo(): void;
  }>();

  private _context: { ports: { server: number } } = { ports: { server: -1 } };

  get uri() {
    return this._uri;
  }

  constructor(private readonly _uri: vscode.Uri) {}

  async backup(
    _context: vscode.CustomDocumentBackupContext,
    _cancellation: vscode.CancellationToken,
  ): Promise<vscode.CustomDocumentBackup> {
    return {
      delete() {},
      id: "",
    };
  }

  setContext(serverPort: number) {
    this._context.ports.server = serverPort;
  }

  async save(_cancellation: vscode.CancellationToken) {
    await fetch(
      `http://localhost:${
        this._context.ports.server
      }/scene/${encodeURIComponent(this.uri.fsPath)}/save`,
      {
        method: "POST",
      },
    );
  }

  async saveAs(
    destination: vscode.Uri,
    _cancellation: vscode.CancellationToken,
  ) {
    await fetch(
      `http://localhost:${
        this._context.ports.server
      }/scene/${encodeURIComponent(
        this.uri.fsPath,
      )}/save-as?newPath=${encodeURIComponent(destination.fsPath)}`,
      {
        method: "POST",
      },
    );
  }

  async revert(_cancellation: vscode.CancellationToken) {
    await fetch(
      `http://localhost:${
        this._context.ports.server
      }/scene/${encodeURIComponent(this.uri.fsPath)}/reset`,
    );
  }

  async upsertProp(data: {
    column: number;
    line: number;
    path: string;
    propName: string;
    propValue: unknown;
  }) {
    const result = await fetch(
      `http://localhost:${this._context.ports.server}/scene/object/${
        data.line
      }/${data.column}/prop?value=${encodeURIComponent(
        toJSONString(data.propValue),
      )}&path=${encodeURIComponent(data.path)}&name=${encodeURIComponent(
        data.propName,
      )}`,
    );

    const response: { redoID: number; undoID: number } = await result.json();

    this._onDidChange.fire({
      label: "Upsert prop",
      redo: async () => {
        await fetch(
          `http://localhost:${
            this._context.ports.server
          }/scene/${encodeURIComponent(this.uri.fsPath)}/redo/${
            response.redoID
          }`,
          {
            method: "POST",
          },
        );
      },
      undo: async () => {
        await fetch(
          `http://localhost:${
            this._context.ports.server
          }/scene/${encodeURIComponent(this.uri.fsPath)}/undo/${
            response.undoID
          }`,
          {
            method: "POST",
          },
        );
      },
    });
  }

  onDidChange = this._onDidChange.event;

  dispose(): void {
    this._onDidChange.dispose();
  }
}
