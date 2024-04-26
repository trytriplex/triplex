/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import "./env";
import { getConfig } from "@triplex/server";
import { join } from "upath";
import * as vscode from "vscode";
import { type Args } from "../project";
import { logger } from "../util/log/node";
import { fork } from "./util/fork";
import { getPort } from "./util/port";
import { getRendererMeta } from "./util/renderer";

const log = logger("vscode_main");

export function activate(context: vscode.ExtensionContext) {
  log("init");

  let panel: vscode.WebviewPanel | undefined;

  context.subscriptions.push(
    vscode.commands.registerCommand("triplex.start", async () => {
      log("start");

      if (panel) {
        log("reveal existing");
        panel.reveal();
      } else {
        log("new panel");
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
          log("disposed");
        });

        panel.webview.html = html;

        const cwd =
          "/Users/douges/projects/triplex-monorepo/examples/test-fixture";
        const config = await getConfig(cwd);
        const ports = {
          client: 3333,
          server: await getPort(),
          ws: 333,
        };
        const renderer = await getRendererMeta({
          cwd,
          filepath: config.renderer,
        });

        log("forking");

        const p = await fork<Args>(
          process.env.NODE_ENV === "production"
            ? join(context.extensionPath, "dist/project.js")
            : join(context.extensionPath, "src/project/index.ts"),
          {
            cwd: context.extensionPath,
            data: { config, cwd, ports, renderer },
          }
        );

        cleanupFunctions.push(() => p.kill());

        await initializePanel(context, panel);

        log("complete");
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
    const editorDevPort = await getPort();
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
