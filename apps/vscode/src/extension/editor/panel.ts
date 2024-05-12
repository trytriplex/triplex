/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { getConfig, getRendererMeta } from "@triplex/server";
import { basename, join, normalize } from "upath";
import * as vscode from "vscode";
import { type Args } from "../../project";
import { fork } from "../util/fork";
import { getPort } from "../util/port";

export interface TriplexProjectData {
  buildHtml: (opts: { exportName: string; path: string }) => string;
  dispose: () => void;
}

export interface TriplexProject {
  (): Promise<TriplexProjectData>;
}

export async function initializeWebviewPanel(
  panel: vscode.WebviewPanel,
  {
    context,
    exportName,
    panelRegistry,
    path,
    projectRegistry,
    triplexProjectCwd,
  }: {
    context: vscode.ExtensionContext;
    exportName: string;
    panelRegistry: Map<string, vscode.WebviewPanel>;
    path: string;
    projectRegistry: Map<string, TriplexProject>;
    triplexProjectCwd: string;
  }
) {
  const resolveProject = projectRegistry.get(triplexProjectCwd);
  const scopedFileName = path;
  const scopedExportName = exportName;

  panelRegistry.set(scopedFileName, panel);

  panel.title = `${basename(path)} (${basename(triplexProjectCwd)})`;

  if (resolveProject) {
    const project = await resolveProject();

    panel.onDidDispose(() => {
      panelRegistry.delete(scopedFileName);
      project.dispose();
    });

    panel.webview.html = project.buildHtml({ exportName, path });

    return;
  }

  const promise = new Promise<TriplexProjectData>((resolve) => {
    const config = getConfig(triplexProjectCwd);
    const disposables: (() => void)[] = [];

    async function main() {
      const ports = {
        client: await getPort(),
        server: await getPort(),
        ws: await getPort(),
      };

      const renderer = await getRendererMeta({
        cwd: triplexProjectCwd,
        filepath: config.renderer,
        getTriplexClientPkgPath: () => require.resolve("@triplex/client"),
      });

      const args: Args = {
        config,
        cwd: triplexProjectCwd,
        ports,
        renderer,
      };

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

      const preload = ({
        exportName,
        path,
      }: {
        exportName: string;
        path: string;
      }) => `
        <script>
          window.triplex = JSON.parse(\`${JSON.stringify({
            env: {
              config: args.config,
              ports: args.ports,
            },
            initialState: {
              exportName,
              path: normalize(path),
            },
          })}\`);
        </script>
      `;

      let constructedHTML: string;

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

        constructedHTML = html
          .replace(
            '"/__base_url_replace__/index.js"',
            panel.webview.asWebviewUri(jsPath).toString()
          )
          .replace(
            '"/__base_url_replace__/assets/index.css"',
            panel.webview.asWebviewUri(cssPath).toString()
          );

        panel.webview.html = preload(initialState) + constructedHTML;
      } else {
        const editorDevPort = await getPort();
        const { createDevServer } = require("../../../scripts/dev");
        const devServer = await createDevServer();
        const cleanup = await devServer.listen(editorDevPort);
        const html = await fetch(`http://localhost:${editorDevPort}`).then(
          (res) => res.text()
        );

        constructedHTML =
          `<base href="http://localhost:${editorDevPort}" />` + html;

        panel.webview.html = preload(initialState) + constructedHTML;

        disposables.push(() => cleanup());
      }

      const dispose = () => {
        if (panelRegistry.size === 0) {
          // Kill all projects if there are no more active panels.
          disposables.forEach((dispose) => dispose());
          projectRegistry.delete(triplexProjectCwd);
        }
      };

      panel.onDidDispose(() => {
        panelRegistry.delete(scopedFileName);
        dispose();
      });

      resolve({
        buildHtml: (initialState: { exportName: string; path: string }) =>
          preload(initialState) + constructedHTML,
        dispose,
      });
    }

    main();
  });

  projectRegistry.set(triplexProjectCwd, () => promise);
}
