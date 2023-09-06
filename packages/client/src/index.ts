/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import react from "@vitejs/plugin-react";
import express from "express";
import { join } from "path";
import tsconfigPaths from "vite-tsconfig-paths";
import { scenePlugin } from "./scene-plugin";
import { createHTML } from "./templates";
import triplexBabelPlugin from "./babel-plugin";

export async function createServer({
  components,
  publicDir,
  files,
  cwd = process.cwd(),
  target,
  provider,
}: {
  target: "web" | "electron";
  cwd?: string;
  components: string[];
  publicDir?: string;
  files: string[];
  provider?: string;
}) {
  const tsConfig = join(cwd, "tsconfig.json");
  const app = express();
  const { createServer: createViteServer } = await import("vite");
  const { default: glsl } = await import("vite-plugin-glsl");

  const vite = await createViteServer({
    configFile: false,
    plugins: [
      react({ babel: { plugins: [triplexBabelPlugin] } }),
      glsl(),
      scenePlugin({ cwd, files, components, provider }),
      tsconfigPaths({ projects: [tsConfig] }),
    ],
    define: {
      __TRIPLEX_TARGET__: `"${target}"`,
      __TRIPLEX_CWD__: `"${cwd}"`,
      __TRIPLEX_BASE_URL__: `"http://localhost:3333"`,
    },
    root: cwd,
    logLevel: "error",
    appType: "custom",
    publicDir,
    server: {
      hmr: {
        overlay: false,
      },
      middlewareMode: true,
    },
    resolve: {
      dedupe: ["@react-three/fiber", "three"],
      alias: {
        // The consuming app doesn't have @triplex/scene as a direct dependency
        // So we use `require.resolve()` to find it from this location instead.
        "@triplex/scene": require.resolve("@triplex/scene"),
      },
    },
  });

  app.use(vite.middlewares);

  app.get("/scene.html", async (_, res, next) => {
    try {
      const template = createHTML();
      const html = await vite.transformIndexHtml("scene", template);

      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });

  return {
    listen: async (port: number) => {
      const server = await app.listen(port);

      const close = async ({ forceExit = true } = {}) => {
        try {
          await server.close();
          await vite.close();
        } finally {
          if (forceExit) {
            process.exit(0);
          }
        }
      };

      process.once("SIGINT", close);
      process.once("SIGTERM", close);

      return close;
    },
  };
}
