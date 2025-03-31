/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { createServer as createHttpServer } from "node:http";
import { createServer as createHttpsServer } from "node:https";
import { loadingLogo } from "@triplex/lib/loader";
import { rootHTML } from "@triplex/lib/templates";
import { type FGEnvironment } from "@triplex/lib/types";
import type {
  ReconciledTriplexConfig,
  RendererManifest,
  TriplexPorts,
} from "@triplex/server";
import react from "@vitejs/plugin-react";
import express from "express";
import resolvePackagePath from "resolve-package-path";
import { version } from "../package.json";
import triplexBabelPlugin from "./babel-plugin";
import { transformNodeModulesJSXPlugin } from "./node-modules-plugin";
import { remoteModulePlugin } from "./remote-module-plugin";
import { scenePlugin } from "./scene-plugin";
import { scripts } from "./templates";
import { getCertificate } from "./util/cert-https";

export async function createServer({
  config,
  fgEnvironmentOverride,
  ports,
  renderer,
  userId,
}: {
  config: ReconciledTriplexConfig;
  fgEnvironmentOverride: FGEnvironment;
  ports: TriplexPorts;
  renderer: {
    manifest: RendererManifest;
    path: string;
    root: string;
  };
  userId: string;
}) {
  const sslCert = await getCertificate("node_modules/.triplex/basic-ssl");
  const app = express();
  const selfSignedHttpsServer = createHttpsServer(
    { cert: sslCert, key: sslCert },
    app,
  );
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
    preload: {
      reactThreeFiber: !!resolvePackagePath("@react-three/fiber", config.cwd),
    },
    userId,
  };

  /**
   * We need to make sure Vite runs in development mode, even after being built
   * for production. This overrides NODE_ENV if it was set to production
   * earlier.
   */
  if (process.env.NODE_ENV === "production") {
    process.env.NODE_ENV = "development";
  }

  const vite = await createViteServer({
    appType: "custom",
    assetsInclude: renderer.manifest.bundler?.assetsInclude,
    cacheDir: `node_modules/.triplex-${version}`,
    configFile: false,
    define: config.define,
    logLevel: "error",
    /**
     * We need to make sure Vite runs in development mode to ensure HMR and
     * related capabilities are turned on.
     */
    mode: "development",
    optimizeDeps: {
      esbuildOptions: { plugins: [transformNodeModulesJSXPlugin()] },
      /**
       * If React Three Fiber is not found in the project we need to stub it out
       * in the dependency graph AND exclude it from pre-bundling so Vite
       * doesn't throw an exception during pre-bundling.
       *
       * {@link ./scene-plugin.ts}
       */
      exclude: initializationConfig.preload.reactThreeFiber
        ? []
        : ["@react-three/fiber", "three"],
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
      tsconfigPaths({ root: config.cwd }),
    ],
    publicDir: config.publicDir,
    resolve: {
      alias: {
        "@triplex/bridge/client": require.resolve("@triplex/bridge/client"),
        "triplex:canvas": renderer.path,
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

  app.get("/scene", async (_, res, next) => {
    try {
      const template = rootHTML({
        loadingIndicator: loadingLogo({
          color: "rgb(59 130 246)",
          position: "hint",
          variant: "stroke",
        }),
        script: scripts.init(initializationConfig),
        title: "Triplex Scene",
      });
      const html = await vite.transformIndexHtml("scene", template);

      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    } catch (error) {
      vite.ssrFixStacktrace(error as Error);
      next(error);
    }
  });

  app.get("/webxr", async (_, res, next) => {
    try {
      const template = rootHTML({
        loadingIndicator: loadingLogo({
          color: "black",
          position: "splash",
          variant: "stroke",
        }),
        title: "Triplex XR",
      });
      const html = await vite.transformIndexHtml("xr", template);

      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    } catch (error) {
      vite.ssrFixStacktrace(error as Error);
      next(error);
    }
  });

  app.get("/screenshot", async (req, res, next) => {
    try {
      const { exportName, path } = req.query;
      if (typeof exportName !== "string" || typeof path !== "string") {
        res.status(404).end();
        return;
      }

      const template = rootHTML({
        script: scripts.thumbnail(initializationConfig, { exportName, path }),
        title: "Triplex Thumbnail",
      });

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
    listen: async (ports: TriplexPorts) => {
      const http = await httpServer.listen(ports.client);
      const https = await selfSignedHttpsServer.listen(ports.clientHttps);

      async function close() {
        try {
          await Promise.all([http.close(), https.close(), vite.close()]);
        } finally {
          process.exit(0);
        }
      }

      process.once("SIGINT", close);
      process.once("SIGTERM", close);

      return close;
    },
  };
}
