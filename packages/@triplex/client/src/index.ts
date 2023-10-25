/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { join } from "node:path";
import react from "@vitejs/plugin-react";
import express from "express";
import tsconfigPaths from "vite-tsconfig-paths";
import triplexBabelPlugin from "./babel-plugin";
import { remoteModulePlugin } from "./remote-module-plugin";
import { scenePlugin } from "./scene-plugin";
import { createHTML } from "./templates";

export async function createServer({
  cwd = process.cwd(),
  files,
  provider,
  publicDir,
  target,
}: {
  cwd?: string;
  files: string[];
  provider?: string;
  publicDir?: string;
  target: "web" | "electron";
}) {
  const normalizedCwd = cwd.replaceAll("\\", "/");
  const tsConfig = join(normalizedCwd, "tsconfig.json");
  const app = express();
  const { createServer: createViteServer } = await import("vite");
  const { default: glsl } = await import("vite-plugin-glsl");

  const vite = await createViteServer({
    appType: "custom",
    configFile: false,
    define: {
      __TRIPLEX_BASE_URL__: `"http://localhost:3333"`,
      __TRIPLEX_CWD__: `"${normalizedCwd}"`,
      __TRIPLEX_TARGET__: `"${target}"`,
    },
    logLevel: "error",
    plugins: [
      remoteModulePlugin({ cwd: normalizedCwd, files }),
      react({
        babel: {
          plugins: [
            triplexBabelPlugin({
              exclude: [
                ...(provider ? [provider] : []),
                "/triplex:scene-frame.tsx",
                "/triplex:empty-provider.tsx",
                "packages/@triplex",
              ],
            }),
          ],
        },
      }),
      glsl(),
      scenePlugin({ cwd: normalizedCwd, files, provider }),
      tsconfigPaths({ projects: [tsConfig] }),
    ],
    publicDir,
    resolve: {
      alias: {
        // The consuming app doesn't have @triplex/scene as a direct dependency
        // So we use `require.resolve()` to find it from this location instead.
        "@triplex/scene": require.resolve("@triplex/scene"),
      },
      dedupe: ["@react-three/fiber", "three"],
    },
    root: normalizedCwd,
    server: {
      hmr: {
        overlay: false,
      },
      middlewareMode: true,
    },
  });

  app.use(vite.middlewares);

  app.get("/scene.html", async (_, res, next) => {
    try {
      const template = createHTML();
      const html = await vite.transformIndexHtml("scene", template);

      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    } catch (error) {
      vite.ssrFixStacktrace(error as Error);
      next(error);
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
