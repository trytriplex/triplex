/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import react from "@vitejs/plugin-react";
import express from "express";
import { join, normalize } from "upath";
import tsconfigPaths from "vite-tsconfig-paths";
import triplexBabelPlugin from "./babel-plugin";
import { emptyProviderId } from "./constants";
import { remoteModulePlugin } from "./remote-module-plugin";
import { scenePlugin } from "./scene-plugin";
import { createHTML } from "./templates";

export async function createServer({
  cwd: __RAW_CWD_DONT_USE__ = process.cwd(),
  files,
  provider = emptyProviderId,
  publicDir,
}: {
  cwd?: string;
  files: string[];
  provider?: string;
  publicDir?: string;
}) {
  const normalizedCwd = normalize(__RAW_CWD_DONT_USE__);
  const tsConfig = join(normalizedCwd, "tsconfig.json");
  const app = express();
  const { createServer: createViteServer } = await import("vite");
  const { default: glsl } = await import("vite-plugin-glsl");

  const vite = await createViteServer({
    appType: "custom",
    assetsInclude: ["**/*.(gltf|glb)"],
    configFile: false,
    define: {
      __TRIPLEX_BASE_URL__: `"http://localhost:3333"`,
      __TRIPLEX_CWD__: `"${normalizedCwd}"`,
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
                "/triplex:empty-provider.tsx",
                "packages/@triplex",
              ],
            }),
          ],
        },
      }),
      glsl(),
      scenePlugin({ provider }),
      tsconfigPaths({ projects: [tsConfig] }),
    ],
    publicDir,
    resolve: {
      alias: {
        "@triplex/bridge/client": require.resolve("@triplex/bridge/client"),
        // The consuming app doesn't have this as a direct dependency
        // so we use `require.resolve()` to find it from this location instead.
        "@triplex/renderer-r3f": require.resolve("@triplex/renderer-r3f"),
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
      const template = createHTML({
        fileGlobs: files.map((f) => `'${f.replace(normalizedCwd, "")}'`),
        pkgName: "@triplex/renderer-r3f",
        providerPath: provider,
      });
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
