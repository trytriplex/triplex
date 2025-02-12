/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
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
    redo(): Promise<void>;
    undo(): Promise<void>;
  }>();

  private _context: { ports: { server: number } } = { ports: { server: -1 } };
  private _modifiedPaths: Record<string, true> = {};
  private _skipNextSave = false;

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
    if (this._skipNextSave) {
      this._skipNextSave = false;
      return;
    }

    for (const path in this._modifiedPaths) {
      await fetch(
        `http://localhost:${
          this._context.ports.server
        }/scene/${encodeURIComponent(path)}/save`,
        {
          method: "POST",
        },
      );
    }
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
    for (const path in this._modifiedPaths) {
      await fetch(
        `http://localhost:${
          this._context.ports.server
        }/scene/${encodeURIComponent(path)}/reset`,
      );
    }
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

      return { ...response, path: data.path };
    });
  }

  async duplicateElement(data: { column: number; line: number; path: string }) {
    return this.undoableAction("Duplicate element", async () => {
      const result = await fetch(
        `http://localhost:${
          this._context.ports.server
        }/scene/${encodeURIComponent(data.path)}/object/${data.line}/${
          data.column
        }/duplicate`,
        { method: "POST" },
      );

      const response: {
        column: number;
        line: number;
        redoID: number;
        undoID: number;
      } = await result.json();

      return { ...response, path: data.path };
    });
  }

  async deleteElement(data: { column: number; line: number; path: string }) {
    return this.undoableAction("Delete element", async () => {
      const result = await fetch(
        `http://localhost:${
          this._context.ports.server
        }/scene/${encodeURIComponent(data.path)}/object/${data.line}/${
          data.column
        }/delete`,
        { method: "POST" },
      );

      const response: {
        column: number;
        line: number;
        redoID: number;
        undoID: number;
      } = await result.json();

      return { ...response, path: data.path };
    });
  }

  async undoableAction<
    TResponse extends { path: string; redoID: number; undoID: number },
  >(
    label: string,
    callback: () => Promise<TResponse> | TResponse,
    opts?: {
      /**
       * Immediately forces the document to be saved but skips calling the
       * Triplex backend. This is done to get rid of the dirty state inside VS
       * Code when the change originates from outside of Triplex.
       *
       * Only use this if you know what you're doing!
       */
      skipDirtyCheck?: boolean;
    },
  ): Promise<Omit<TResponse, "redoID" | "undoID" | "path">> {
    const { path, redoID, undoID, ...response } = await callback();

    this._modifiedPaths[path] = true;

    this._onDidChange.fire({
      label,
      redo: async () => {
        await fetch(
          `http://localhost:${
            this._context.ports.server
          }/scene/${encodeURIComponent(path)}/redo/${redoID}`,
          {
            method: "POST",
          },
        );
      },
      undo: async () => {
        await fetch(
          `http://localhost:${
            this._context.ports.server
          }/scene/${encodeURIComponent(path)}/undo/${undoID}`,
          {
            method: "POST",
          },
        );
      },
    });

    if (opts?.skipDirtyCheck) {
      this._skipNextSave = true;
      vscode.workspace.save(this.uri);
    }

    return response;
  }

  dispose(): void {
    this._onDidChange.dispose();
  }
}
