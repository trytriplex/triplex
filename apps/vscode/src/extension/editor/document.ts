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

  onDidChange = this._onDidChange.event;

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
    return this.undoableAction("Upsert prop", async () => {
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
      return response;
    });
  }

  async duplicateElement(element: {
    column: number;
    line: number;
    path: string;
  }) {
    return this.undoableAction("Duplicate element", async () => {
      const result = await fetch(
        `http://localhost:${
          this._context.ports.server
        }/scene/${encodeURIComponent(element.path)}/object/${element.line}/${
          element.column
        }/duplicate`,
        { method: "POST" },
      );

      const response: {
        column: number;
        line: number;
        redoID: number;
        undoID: number;
      } = await result.json();

      return response;
    });
  }

  private async undoableAction<
    TResponse extends { redoID: number; undoID: number },
  >(
    label: string,
    callback: () => Promise<TResponse>,
  ): Promise<Omit<TResponse, "redoID" | "undoID">> {
    const { redoID, undoID, ...response } = await callback();

    this._onDidChange.fire({
      label,
      redo: async () => {
        await fetch(
          `http://localhost:${
            this._context.ports.server
          }/scene/${encodeURIComponent(this.uri.fsPath)}/redo/${redoID}`,
          {
            method: "POST",
          },
        );
      },
      undo: async () => {
        await fetch(
          `http://localhost:${
            this._context.ports.server
          }/scene/${encodeURIComponent(this.uri.fsPath)}/undo/${undoID}`,
          {
            method: "POST",
          },
        );
      },
    });

    return response;
  }

  dispose(): void {
    this._onDidChange.dispose();
  }
}
