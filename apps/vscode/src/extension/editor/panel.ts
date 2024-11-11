/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { basename, join, normalize } from "upath";
import * as vscode from "vscode";
import { sendVSCE } from "../util/bridge";
import { getPort } from "../util/port";
import { resolveProject, type TriplexProjectResolver } from "./project";

export async function initializeWebviewPanel(
  panel: vscode.WebviewPanel,
  {
    context,
    exportName,
    panelCache,
    path,
    projectCache,
    triplexProjectCwd,
  }: {
    context: vscode.ExtensionContext;
    exportName: string;
    panelCache: Map<string, vscode.WebviewPanel>;
    path: string;
    projectCache: Map<string, TriplexProjectResolver>;
    triplexProjectCwd: string;
  },
) {
  // This is needed for e2e tests as this sets the aria label of the panel.
  panel.title = `${basename(path)} (${basename(triplexProjectCwd)})`;

  panel.webview.options = {
    enableScripts: true,
  };

  // Show something as fast as possible before doing anything.
  panel.webview.html = await vscode.workspace.fs
    .readFile(vscode.Uri.file(join(context.extensionPath, "loading.html")))
    .then((res) => res.toString());

  const scopedFileName = normalize(path);

  panelCache.set(scopedFileName, panel);

  panel.onDidDispose(() => {
    panelCache.delete(scopedFileName);
  });

  panel.onDidChangeViewState((e) => {
    sendVSCE(panel.webview, "vscode:state-change", {
      active: e.webviewPanel.active,
    });
  });

  const project = await resolveProject(
    triplexProjectCwd,
    projectCache,
    context,
  );

  panel.onDidDispose(() => {
    project.dispose();
  });

  let panelHTML = `
    <script>
      window.triplex = JSON.parse(\`${JSON.stringify({
        env: {
          config: project.args.config,
          fgEnvironmentOverride: process.env.FG_ENVIRONMENT_OVERRIDE,
          ports: project.args.ports,
        },
        initialState: {
          exportName,
          path: normalize(path),
        },
        isTelemetryEnabled: vscode.env.isTelemetryEnabled,
        sessionId: vscode.env.sessionId,
        userId: vscode.env.machineId,
      })}\`);
    </script>
  `;

  if (process.env.NODE_ENV === "production") {
    const cssPath = vscode.Uri.file(
      join(context.extensionPath, "dist/assets/index.css"),
    );
    const jsPath = vscode.Uri.file(
      join(context.extensionPath, "dist/index.js"),
    );
    const html = await vscode.workspace.fs
      .readFile(vscode.Uri.file(join(__dirname, "index.html")))
      .then((res) => res.toString());

    panelHTML += html
      .replace(
        '"/__base_url_replace__/index.js"',
        panel.webview.asWebviewUri(jsPath).toString(),
      )
      .replace(
        '"/__base_url_replace__/assets/index.css"',
        panel.webview.asWebviewUri(cssPath).toString(),
      );
  } else {
    const editorDevPort = await getPort();
    const { createDevServer } = require("../../../scripts/dev");
    const devServer = await createDevServer();
    const cleanup = await devServer.listen(editorDevPort);
    const html = await fetch(`http://localhost:${editorDevPort}`).then((res) =>
      res.text(),
    );

    panelHTML += `<base href="http://localhost:${editorDevPort}" />` + html;

    panel.onDidDispose(() => {
      cleanup();
    });
  }

  panel.webview.html = panelHTML;

  return project.ports;
}
