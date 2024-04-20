/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import "./env";
import { createServer as createClientServer } from "@triplex/client";
import { createServer, getConfig } from "@triplex/server";
import { join } from "upath";
import * as vscode from "vscode";
import { getRendererMeta } from "./utils/renderer";

export function activate(context: vscode.ExtensionContext) {
  let panel: vscode.WebviewPanel | undefined;

  context.subscriptions.push(
    vscode.commands.registerCommand("triplex.start", async () => {
      if (panel) {
        panel.reveal();
      } else {
        // Show something as fast as possible before doing anything.
        const cleanupFunctions: (() => void)[] = [];
        const html = await vscode.workspace.fs
          .readFile(
            vscode.Uri.file(join(context.extensionPath, "loading.html"))
          )
          .then((res) => res.toString());

        panel = vscode.window.createWebviewPanel(
          "triplex",
          "Triplex",
          vscode.ViewColumn.Beside,
          {
            enableScripts: true,
          }
        );

        panel.onDidDispose(() => {
          panel = undefined;
          cleanupFunctions.forEach((cleanup) => cleanup());
        });

        panel.webview.html = html;

        // TODO: Don't hardcode cwd.
        const cwd =
          "/Users/douges/projects/triplex-monorepo/examples/test-fixture";
        process.chdir(cwd);
        const config = await getConfig(cwd);
        const ports = { client: 3333, server: 8080, ws: 333 };
        const renderer = await getRendererMeta({
          cwd,
          filepath: config.renderer,
        });
        const server = await createServer({
          config,
          renderer,
        });
        const client = await createClientServer({
          config,
          ports,
          renderer,
        });

        cleanupFunctions.push(
          await server.listen(ports),
          await client.listen(ports.client),
          await initializePanel(context, panel)
        );
      }
    })
  );
}

async function initializePanel(
  context: vscode.ExtensionContext,
  panel: vscode.WebviewPanel
) {
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

    panel.webview.html = html
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
    const editorDevPort = 4444;
    const { createDevServer } = require("../../scripts/dev");
    const devServer = await createDevServer();
    const cleanup = await devServer.listen(editorDevPort);
    const html = await fetch(`http://localhost:${editorDevPort}`).then((res) =>
      res.text()
    );

    panel.webview.html =
      `<base href="http://localhost:${editorDevPort}" />` + html;

    return () => {
      cleanup();
    };
  }
}

export function deactivate() {}
