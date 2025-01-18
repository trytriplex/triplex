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
import { join } from "upath";
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
  const tsConfig = join(config.cwd, "tsconfig.json");
  const app = express();
  const httpServer = createHttpServer(app);
  const { createServer: createViteServer } = await import("vite");
  const { default: glsl } = await import("vite-plugin-glsl");
  const { default: tsconfigPaths } = await import("vite-tsconfig-paths");

  const initializationConfig = {
    config,
    fgEnvironmentOverride,
    fileGlobs: config.files.map((f) => `'${f.replace(config.cwd, "")}'`),
    pkgName: "triplex:renderer",
    ports,
    userId,
  };

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
      remoteModulePlugin({ cwd: config.cwd, files: config.files, ports }),
      // ---------------------------------------------------------------
      // TODO: Vite plugins should be loaded from a renderer's manifest
      // instead of hardcoded. We'll cross this bridge to resolve later.
      react({
        babel: {
          plugins: [
            triplexBabelPlugin({
              cwd: config.cwd,
              exclude: [config.provider, renderer.root, "triplex:"],
            }),
          ],
        },
      }),
      glsl(),
      // ---------------------------------------------------------------
      scenePlugin(initializationConfig),
      tsconfigPaths({
        /**
         * JavaScript based projects without a tsconfig.json will throw errors.
         * Rather than conditionally applying this plugin we just ignore any
         * errors and continue on. Same same but less code we have to handle!
         */
        ignoreConfigErrors: true,
        projects: [tsConfig],
      }),
    ],
    publicDir: config.publicDir,
    resolve: {
      alias: {
        "@triplex/bridge/client": require.resolve("@triplex/bridge/client"),
        "triplex:canvas": require.resolve("@triplex/renderer"),
        "triplex:renderer": renderer.path,
      },
      dedupe: renderer.manifest.bundler?.dedupe,
    },
    root: config.cwd,
    server: {
      hmr: {
        overlay: false,
        path: "/__hmr_client__",
        server: httpServer,
      },
      middlewareMode: true,
    },
  });

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
      const template = createHTML(scripts.init(initializationConfig), {
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
        scripts.thumbnail(initializationConfig, { exportName, path }),
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
