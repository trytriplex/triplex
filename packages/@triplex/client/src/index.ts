/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import type { RendererManifest } from "@triplex/server";
import react from "@vitejs/plugin-react";
import express from "express";
import { join, normalize } from "upath";
import tsconfigPaths from "vite-tsconfig-paths";
import triplexBabelPlugin from "./babel-plugin";
import { emptyProviderId } from "./constants";
import { remoteModulePlugin } from "./remote-module-plugin";
import { scenePlugin } from "./scene-plugin";
import { createHTML, scripts } from "./templates";

export async function createServer({
  cwd: __RAW_CWD_DONT_USE__ = process.cwd(),
  files,
  ports,
  provider = emptyProviderId,
  publicDir,
  renderer,
}: {
  cwd?: string;
  files: string[];
  ports: { server: number; ws: number };
  provider?: string;
  publicDir?: string;
  renderer: {
    manifest: RendererManifest;
    path: string;
    root: string;
  };
}) {
  const normalizedCwd = normalize(__RAW_CWD_DONT_USE__);
  const tsConfig = join(normalizedCwd, "tsconfig.json");
  const app = express();
  const { createServer: createViteServer } = await import("vite");
  const { default: glsl } = await import("vite-plugin-glsl");

  const vite = await createViteServer({
    appType: "custom",
    assetsInclude: renderer.manifest.bundler?.assetsInclude,
    configFile: false,
    define: {
      __TRIPLEX_CWD__: `"${normalizedCwd}"`,
      __TRIPLEX_DATA__: JSON.stringify(process.env.TRIPLEX_DATA),
    },
    logLevel: "error",
    plugins: [
      remoteModulePlugin({ cwd: normalizedCwd, files, ports }),
      react({
        babel: {
          plugins: [
            triplexBabelPlugin({
              exclude: [provider, renderer.root],
            }),
          ],
        },
      }),
      // TODO: Vite plugins should be loaded from a renderer's manfiest
      // instead of hardcoded. We'll cross this bridge to resolve later.
      glsl(),
      scenePlugin({ provider }),
      tsconfigPaths({ projects: [tsConfig] }),
    ],
    publicDir,
    resolve: {
      alias: {
        "@triplex/bridge/client": require.resolve("@triplex/bridge/client"),
        __triplex_renderer__: renderer.path,
      },
      dedupe: renderer.manifest.bundler?.dedupe,
    },
    root: normalizedCwd,
    server: {
      hmr: {
        overlay: false,
      },
      middlewareMode: true,
    },
  });

  const htmlConfig = {
    config: { provider },
    fileGlobs: files.map((f) => `'${f.replace(normalizedCwd, "")}'`),
    pkgName: "__triplex_renderer__",
  };

  app.use(vite.middlewares);

  app.get("/scene.html", async (_, res, next) => {
    try {
      const template = createHTML(scripts.bootstrap(htmlConfig));
      const html = await vite.transformIndexHtml("scene", template);

      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    } catch (error) {
      vite.ssrFixStacktrace(error as Error);
      next(error);
    }
  });

  app.get("/__thumbnail", async (req, res, next) => {
    try {
      const { exportName, path } = req.query;
      if (typeof exportName !== "string" || typeof path !== "string") {
        res.status(404).end();
        return;
      }

      const template = createHTML(
        scripts.render(htmlConfig, { exportName, path })
      );
      const html = await vite.transformIndexHtml(
        `thumbnail_${path}_${exportName}`,
        template
      );

      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    } catch (error) {
      vite.ssrFixStacktrace(error as Error);
      next(error);
    }
  });

  return {
    listen: async (port: number) => {
      const server = await app.listen(port);

      const close = async () => {
        try {
          await server.close();
          await vite.close();
        } finally {
          process.exit(0);
        }
      };

      process.once("SIGINT", close);
      process.once("SIGTERM", close);

      return close;
    },
  };
}
