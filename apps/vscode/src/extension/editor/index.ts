/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { readFileSync } from "node:fs";
import { inferExports, resolveProjectCwd } from "@triplex/server";
import { dirname, join, normalize } from "upath";
import * as vscode from "vscode";
import { sendVSCE } from "../util/bridge";
import { TriplexDocument } from "./document";
import { initializeWebviewPanel, type TriplexProject } from "./panel";

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
  static readonly viewType = "triplex.editor";

  private static _nextExportName = "";
  private static readonly activePanels = new Map<string, vscode.WebviewPanel>();
  private static readonly activeProjects = new Map<string, TriplexProject>();
  private constructor(private readonly _context: vscode.ExtensionContext) {}

  get nextExportName() {
    const next = TriplexEditorProvider._nextExportName;
    TriplexEditorProvider._nextExportName = "";
    return next;
  }

  static set nextExportName(value: string) {
    this._nextExportName = value;
  }

  backupCustomDocument(
    document: TriplexDocument,
    context: vscode.CustomDocumentBackupContext,
    cancellation: vscode.CancellationToken
  ) {
    return document.backup(context, cancellation);
  }

  saveCustomDocument(
    document: TriplexDocument,
    cancellation: vscode.CancellationToken
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
    _token: vscode.CancellationToken
  ) {
    return new TriplexDocument(uri);
  }

  async resolveCustomEditor(
    document: TriplexDocument,
    panel: vscode.WebviewPanel,
    _token: vscode.CancellationToken
  ) {
    const scopedFileName = document.uri.fsPath;
    const triplexProjectCwd = resolveProjectCwd(dirname(scopedFileName));

    if (!triplexProjectCwd) {
      return;
    }

    panel.webview.options = {
      enableScripts: true,
    };

    // Show something as fast as possible before doing anything.
    const html = await vscode.workspace.fs
      .readFile(
        vscode.Uri.file(join(this._context.extensionPath, "loading.html"))
      )
      .then((res) => res.toString());

    panel.webview.html = html;

    initializeWebviewPanel(panel, {
      context: this._context,
      exportName: this.nextExportName,
      panelRegistry: TriplexEditorProvider.activePanels,
      path: scopedFileName,
      projectRegistry: TriplexEditorProvider.activeProjects,
      triplexProjectCwd,
    });
  }

  revertCustomDocument(
    document: TriplexDocument,
    cancellation: vscode.CancellationToken
  ) {
    return document.revert(cancellation);
  }

  saveCustomDocumentAs(
    document: TriplexDocument,
    destination: vscode.Uri,
    cancellation: vscode.CancellationToken
  ) {
    return document.saveAs(destination, cancellation);
  }

  public static register(context: vscode.ExtensionContext): vscode.Disposable {
    const disposables = [
      vscode.commands.registerCommand(
        "triplex.set-camera-default",
        (e: { path: string } | undefined) => {
          const panel = e && this.activePanels.get(e.path);
          if (!panel) {
            return;
          }

          sendVSCE(panel.webview, "vscode:play-camera", { name: "default" });
        }
      ),
      vscode.commands.registerCommand(
        "triplex.set-camera-editor",
        (e: { path: string } | undefined) => {
          const panel = e && this.activePanels.get(e.path);
          if (!panel) {
            return;
          }

          sendVSCE(panel.webview, "vscode:play-camera", { name: "editor" });
        }
      ),
      vscode.commands.registerCommand(
        "triplex.start",
        async (ctx?: { exportName: string; path: string }) => {
          const scopedFileName = normalize(
            ctx?.path || vscode.window.activeTextEditor?.document.fileName || ""
          );

          if (!scopedFileName) {
            return;
          }

          const existingPanel =
            TriplexEditorProvider.activePanels.get(scopedFileName);

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
            this.nextExportName = nextExportName;

            vscode.commands.executeCommand(
              "vscode.openWith",
              vscode.Uri.file(scopedFileName),
              TriplexEditorProvider.viewType,
              vscode.ViewColumn.Beside
            );
          }
        }
      ),
      vscode.window.registerCustomEditorProvider(
        TriplexEditorProvider.viewType,
        new TriplexEditorProvider(context),
        {
          supportsMultipleEditorsPerDocument: false,
          webviewOptions: {
            retainContextWhenHidden: true,
          },
        }
      ),
    ];

    return {
      dispose() {
        disposables.forEach((d) => d.dispose());
      },
    };
  }
}
