/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { readFileSync } from "node:fs";
import { inferExports, resolveProjectCwd } from "@triplex/server";
import { on as onWS } from "@triplex/ws";
import { dirname, normalize } from "upath";
import * as vscode from "vscode";
import { logger } from "../../util/log/vscode";
import { on, sendVSCE } from "../util/bridge";
import { TriplexDocument } from "./document";
import { initializeWebviewPanel } from "./panel";
import { type TriplexProjectResolver } from "./project";

const log = logger("scene");

function getFallbackExportName(filepath: string): string {
  const code = readFileSync(filepath, "utf8");
  const exports = inferExports(code);
  const lastExport = exports[0];

  if (!lastExport) {
    throw new Error("invariant: export not found");
  }

  return lastExport.exportName;
}

export class TriplexEditorProvider
  implements vscode.CustomEditorProvider<TriplexDocument>
{
  private static readonly viewType = "triplex.editor";
  private static _next: undefined | { exportName: string };
  private static readonly panelCache = new Map<string, vscode.WebviewPanel>();
  private static readonly projectCache = new Map<
    string,
    TriplexProjectResolver
  >();
  private constructor(private readonly _context: vscode.ExtensionContext) {}

  get next() {
    const next = TriplexEditorProvider._next;
    return next;
  }

  static set next(value: TriplexEditorProvider["next"]) {
    this._next = value;
  }

  backupCustomDocument(
    document: TriplexDocument,
    context: vscode.CustomDocumentBackupContext,
    cancellation: vscode.CancellationToken,
  ) {
    return document.backup(context, cancellation);
  }

  saveCustomDocument(
    document: TriplexDocument,
    cancellation: vscode.CancellationToken,
  ) {
    return document.save(cancellation);
  }

  private readonly _onDidChangeCustomDocument = new vscode.EventEmitter<
    vscode.CustomDocumentEditEvent<TriplexDocument>
  >();

  onDidChangeCustomDocument = this._onDidChangeCustomDocument.event;

  openCustomDocument(
    uri: vscode.Uri,
    _openContext: vscode.CustomDocumentOpenContext,
    _token: vscode.CancellationToken,
  ) {
    const document = new TriplexDocument(uri);

    document.onDidChange((event) => {
      this._onDidChangeCustomDocument.fire({
        document,
        label: event.label,
        redo: event.redo,
        undo: event.undo,
      });
    });

    return document;
  }

  async resolveCustomEditor(
    document: TriplexDocument,
    panel: vscode.WebviewPanel,
    _token: vscode.CancellationToken,
  ) {
    const scopedFileName = document.uri.fsPath;
    const triplexProjectCwd = resolveProjectCwd(dirname(scopedFileName));

    if (!triplexProjectCwd) {
      return;
    }

    const panelContext = this.next;
    if (!panelContext) {
      // Missing initial data.
      return;
    }

    // We deliberately don't await the initialization so vscode can show the Triplex loading screen immediately.
    initializeWebviewPanel(panel, {
      context: this._context,
      exportName: panelContext.exportName,
      panelCache: TriplexEditorProvider.panelCache,
      path: scopedFileName,
      projectCache: TriplexEditorProvider.projectCache,
      triplexProjectCwd,
    }).then((ports) => {
      document.setContext(ports.server);

      const disposables = [
        onWS(
          "fs-external-change",
          (data) => {
            if (data.path !== scopedFileName) {
              // We're only interested in changes that were made to this document.
              return;
            }
            document.undoableAction("Sync from filesystem", () => data, {
              skipDirtyCheck: true,
            });
          },
          ports.ws,
        ),
        on(panel.webview, "element-set-prop", (prop) => {
          document.upsertProp(prop);
        }),
        on(panel.webview, "error", (error) => {
          vscode.window.showErrorMessage(`${error.title}: ${error.message}`);
          log.error(error.message);
        }),
        on(panel.webview, "element-duplicate", async (element) => {
          const newElement = await document.duplicateElement(element);
          sendVSCE(panel.webview, "vscode:request-focus-element", {
            ...element,
            ...newElement,
          });
        }),
        on(panel.webview, "element-delete", async (element) => {
          sendVSCE(panel.webview, "vscode:request-blur-element", undefined);
          await document.deleteElement(element);
        }),
        on(panel.webview, "notification", async (data) => {
          switch (data.type) {
            case "info":
              return vscode.window.showInformationMessage(
                data.message,
                ...data.actions,
              );

            case "warning":
              return vscode.window.showWarningMessage(
                data.message,
                ...data.actions,
              );

            case "error":
              return vscode.window.showErrorMessage(
                data.message,
                ...data.actions,
              );
          }
        }),
      ];

      panel.onDidDispose(() => {
        disposables.forEach((dispose) => dispose());
      });
    });
  }

  revertCustomDocument(
    document: TriplexDocument,
    cancellation: vscode.CancellationToken,
  ) {
    return document.revert(cancellation);
  }

  saveCustomDocumentAs(
    document: TriplexDocument,
    destination: vscode.Uri,
    cancellation: vscode.CancellationToken,
  ) {
    return document.saveAs(destination, cancellation);
  }

  public static register(context: vscode.ExtensionContext): vscode.Disposable {
    const resolveActivePanel = (cb: (p: vscode.WebviewPanel) => void) => {
      const panel = Array.from(this.panelCache.values()).find(
        (panel) => panel.active,
      );

      if (panel) {
        cb(panel);
      }
    };

    const disposables = [
      vscode.commands.registerCommand("triplex.element-delete", (args) => {
        resolveActivePanel((panel) => {
          sendVSCE(
            panel.webview,
            "vscode:request-delete-element",
            args
              ? {
                  column: args.column,
                  line: args.line,
                  path: args.path,
                }
              : undefined,
          );
        });
      }),
      vscode.commands.registerCommand("triplex.element-duplicate", (args) => {
        resolveActivePanel((panel) => {
          sendVSCE(
            panel.webview,
            "vscode:request-duplicate-element",
            args
              ? {
                  column: args.column,
                  line: args.line,
                  path: args.path,
                }
              : undefined,
          );
        });
      }),
      vscode.commands.registerCommand("triplex.element-jump-to", (args) => {
        resolveActivePanel((panel) => {
          sendVSCE(
            panel.webview,
            "vscode:request-jump-to-element",
            args
              ? {
                  column: args.column,
                  line: args.line,
                  path: args.path,
                }
              : undefined,
          );
        });
      }),
      vscode.commands.registerCommand("triplex.set-camera-default", () => {
        resolveActivePanel((panel) => {
          sendVSCE(panel.webview, "vscode:play-camera", {
            name: "default",
          });
        });
      }),
      vscode.commands.registerCommand("triplex.set-camera-editor", () => {
        resolveActivePanel((panel) => {
          sendVSCE(panel.webview, "vscode:play-camera", {
            name: "editor",
          });
        });
      }),
      vscode.commands.registerCommand("triplex.refresh-scene", () => {
        resolveActivePanel((panel) => {
          sendVSCE(panel.webview, "vscode:request-refresh-scene", undefined);
        });
      }),
      vscode.commands.registerCommand("triplex.reload-scene", () => {
        resolveActivePanel((panel) => {
          sendVSCE(panel.webview, "vscode:request-reload-scene", undefined);
        });
      }),
      vscode.commands.registerCommand(
        "triplex.start",
        async (ctx?: { exportName: string; path: string }) => {
          const scopedFileName = normalize(
            ctx?.path ||
              vscode.window.activeTextEditor?.document.fileName ||
              "",
          );

          if (!scopedFileName) {
            return;
          }

          const existingPanel =
            TriplexEditorProvider.panelCache.get(scopedFileName);

          const nextExportName =
            ctx?.exportName || getFallbackExportName(scopedFileName);

          if (existingPanel) {
            sendVSCE(existingPanel.webview, "vscode:request-open-component", {
              exportName: nextExportName,
              path: scopedFileName,
            });
            existingPanel.reveal();
          } else {
            // We set this here as we need to pass the data onto the webview resolver but
            // it only gets access to the uri path — if we add the export name as a query
            // it is considered a unique file name so opens another editor which isn't correct.
            this.next = { exportName: nextExportName };

            vscode.commands.executeCommand(
              "vscode.openWith",
              // We set an extra to the file path to have vscode consider it a unique file.
              // This means when we perform undo/redo/save actions it's isolated to the triplex
              // editor rather than shared with the default editor.
              // NOTE: Breadcrumbs get messed up when supplying the query.
              // See: https://github.com/microsoft/vscode/issues/213633
              vscode.Uri.file(scopedFileName).with({ query: "triplex" }),
              TriplexEditorProvider.viewType,
              vscode.ViewColumn.Beside,
            );
          }
        },
      ),
      vscode.window.registerCustomEditorProvider(
        TriplexEditorProvider.viewType,
        new TriplexEditorProvider(context),
        {
          supportsMultipleEditorsPerDocument: false,
          webviewOptions: {
            retainContextWhenHidden: false,
          },
        },
      ),
    ];

    return {
      dispose() {
        disposables.forEach((d) => d.dispose());
      },
    };
  }
}
