/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { readFileSync } from "node:fs";
import { getConfig, getRendererMeta, inferExports } from "@triplex/server";
import { basename, join } from "upath";
import * as vscode from "vscode";
import { type Args } from "../project";
import { logger } from "../util/log/node";
import { CodelensProvider } from "./codelens";
import { sendVSCE } from "./util/bridge";
import { fork } from "./util/fork";
import { getPort } from "./util/port";

const log = logger("vscode_main");

function getFallbackExportName(filepath: string): string {
  const code = readFileSync(filepath, "utf8");
  const exports = inferExports(code);
  const lastExport = exports.at(-1);

  if (!lastExport) {
    throw new Error("invariant: export not found");
  }

  return lastExport.exportName;
}

function getPanelName(path: string, exportName: string) {
  return `${basename(path)} (${exportName})`;
}

export function activate(context: vscode.ExtensionContext) {
  log("init");

  let panel: vscode.WebviewPanel | undefined;

  context.subscriptions.push(
    vscode.languages.registerCodeLensProvider(
      [
        { language: "typescriptreact", scheme: "file" },
        { language: "javascriptreact", scheme: "file" },
      ],
      new CodelensProvider()
    ),
    vscode.commands.registerCommand(
      "triplex.start",
      async (ctx?: { exportName: string; path: string }) => {
        const scopedFileName =
          ctx?.path || vscode.window.activeTextEditor?.document.fileName || "";
        const activeWorkspace = vscode.workspace.workspaceFolders?.find((e) =>
          scopedFileName.startsWith(e.uri.fsPath)
        );

        if (!scopedFileName || !activeWorkspace) {
          log("nothing active aborting");
          return;
        }

        const scopedExportName =
          ctx?.exportName || getFallbackExportName(scopedFileName);

        log("start");

        if (panel) {
          log("reveal existing");
          sendVSCE(panel.webview, "vscode:request-open-component", {
            exportName: scopedExportName,
            path: scopedFileName,
          });
          panel.title = getPanelName(scopedFileName, scopedExportName);
          panel.reveal();
        } else {
          log("new panel");
          // Show something as fast as possible before doing anything.
          const disposables: (() => void)[] = [];
          const html = await vscode.workspace.fs
            .readFile(
              vscode.Uri.file(join(context.extensionPath, "loading.html"))
            )
            .then((res) => res.toString());

          panel = vscode.window.createWebviewPanel(
            "triplex.editor",
            getPanelName(scopedFileName, scopedExportName),
            vscode.ViewColumn.Beside,
            {
              enableScripts: true,
              retainContextWhenHidden: true,
            }
          );

          panel.onDidDispose(() => {
            panel = undefined;
            disposables.forEach((cleanup) => cleanup());
            log("disposed");
          });

          panel.webview.html = html;
          panel.iconPath = vscode.Uri.file(
            join(context.extensionPath, "static", "logo.svg")
          );

          const cwd = activeWorkspace.uri.fsPath;
          const config = await getConfig(cwd);
          const ports = {
            client: await getPort(),
            server: await getPort(),
            ws: await getPort(),
          };
          const renderer = await getRendererMeta({
            cwd,
            filepath: config.renderer,
            getTriplexClientPkgPath: () => require.resolve("@triplex/client"),
          });

          log("forking");

          const args: Args = { config, cwd, ports, renderer };
          const initialState = {
            exportName: scopedExportName,
            path: scopedFileName,
          };

          const p = await fork<Args>(
            process.env.NODE_ENV === "production"
              ? join(context.extensionPath, "dist/project.js")
              : join(context.extensionPath, "src/project/index.ts"),
            {
              cwd: context.extensionPath,
              data: args,
            }
          );

          disposables.push(() => p.kill());

          await initializePanel({ args, context, initialState, panel });

          log("complete");
        }
      }
    )
  );
}

async function initializePanel({
  args,
  context,
  initialState,
  panel,
}: {
  args: Args;
  context: vscode.ExtensionContext;
  initialState: { exportName: string; path: string };
  panel: vscode.WebviewPanel;
}) {
  const preload = `
    <script>
      window.triplex = {
        env: JSON.parse(\`${JSON.stringify({
          config: args.config,
          ports: args.ports,
        })}\`),
        initialState: JSON.parse(\`${JSON.stringify(initialState)}\`),
      };
    </script>
  `;

  if (process.env.NODE_ENV === "production") {
    const cssPath = vscode.Uri.file(
      join(context.extensionPath, "dist/assets/index.css")
    );
    const jsPath = vscode.Uri.file(
      join(context.extensionPath, "dist/index.js")
    );
    const html = await vscode.workspace.fs
      .readFile(vscode.Uri.file(join(__dirname, "index.html")))
      .then((res) => res.toString());

    panel.webview.html =
      preload +
      html
        .replace(
          '"/__base_url_replace__/index.js"',
          panel.webview.asWebviewUri(jsPath).toString()
        )
        .replace(
          '"/__base_url_replace__/assets/index.css"',
          panel.webview.asWebviewUri(cssPath).toString()
        );

    return () => {};
  } else {
    const editorDevPort = await getPort();
    const { createDevServer } = require("../../scripts/dev");
    const devServer = await createDevServer();
    const cleanup = await devServer.listen(editorDevPort);
    const html = await fetch(`http://localhost:${editorDevPort}`).then((res) =>
      res.text()
    );

    panel.webview.html =
      `<base href="http://localhost:${editorDevPort}" />` + preload + html;

    return () => {
      cleanup();
    };
  }
}

export function deactivate() {}
