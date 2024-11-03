/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { createServer as createHttpServer } from "node:http";
import type {
  ReconciledTriplexConfig,
  RendererManifest,
  TriplexPorts,
} from "@triplex/server";
import react from "@vitejs/plugin-react";
import express from "express";
import { join, normalize } from "upath";
import { version } from "../package.json";
import triplexBabelPlugin from "./babel-plugin";
import { transformNodeModulesJSXPlugin } from "./node-modules-plugin";
import { remoteModulePlugin } from "./remote-module-plugin";
import { scenePlugin } from "./scene-plugin";
import { createHTML, loading, scripts } from "./templates";

export async function createServer({
  config,
  fgEnvironmentOverride,
  ports,
  renderer,
  userId,
}: {
  config: ReconciledTriplexConfig;
  fgEnvironmentOverride: "production" | "staging" | "development" | "local";
  ports: TriplexPorts;
  renderer: {
    manifest: RendererManifest;
    path: string;
    root: string;
  };
  userId: string;
}) {
  const normalizedCwd = normalize(config.cwd);
  const tsConfig = join(normalizedCwd, "tsconfig.json");
  const app = express();
  const httpServer = createHttpServer(app);
  const { createServer: createViteServer } = await import("vite");
  const { default: glsl } = await import("vite-plugin-glsl");
  const { default: tsconfigPaths } = await import("vite-tsconfig-paths");

  const vite = await createViteServer({
    appType: "custom",
    assetsInclude: renderer.manifest.bundler?.assetsInclude,
    cacheDir: `node_modules/.triplex-${version}`,
    configFile: false,
    define: config.define,
    logLevel: "error",
    optimizeDeps: {
      esbuildOptions: { plugins: [transformNodeModulesJSXPlugin()] },
    },
    plugins: [
      remoteModulePlugin({ cwd: normalizedCwd, files: config.files, ports }),
      // ---------------------------------------------------------------
      // TODO: Vite plugins should be loaded from a renderer's manifest
      // instead of hardcoded. We'll cross this bridge to resolve later.
      react({
        babel: {
          plugins: [
            triplexBabelPlugin({
              cwd: normalizedCwd,
              exclude: [config.provider, renderer.root],
            }),
          ],
        },
      }),
      glsl(),
      // ---------------------------------------------------------------
      scenePlugin({ config }),
      tsconfigPaths({ projects: [tsConfig] }),
    ],
    publicDir: config.publicDir,
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
        path: "/__hmr_client__",
        server: httpServer,
      },
      middlewareMode: true,
    },
  });

  const htmlConfig = {
    config,
    fgEnvironmentOverride,
    fileGlobs: config.files.map((f) => `'${f.replace(normalizedCwd, "")}'`),
    pkgName: "__triplex_renderer__",
    ports,
    userId,
  };

  app.use((_, res, next) => {
    res.set({
      // These headers are needed to enable shared array buffers.
      // See: https://web.dev/articles/cross-origin-isolation-guide
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Resource-Policy": "cross-origin",
    });
    next();
  });

  app.use(vite.middlewares);

  app.get("/scene.html", async (_, res, next) => {
    try {
      const template = createHTML(scripts.bootstrap(htmlConfig), {
        initial: loading(),
      });
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
        scripts.thumbnail(htmlConfig, { exportName, path }),
      );
      const html = await vite.transformIndexHtml(
        `thumbnail_${path}_${exportName}`,
        template,
      );

      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    } catch (error) {
      vite.ssrFixStacktrace(error as Error);
      next(error);
    }
  });

  return {
    listen: async (port: number) => {
      const server = await httpServer.listen(port);

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
