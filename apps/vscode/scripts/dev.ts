/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import react from "@vitejs/plugin-react";
import { join } from "upath";

export async function createDevServer() {
  const { createServer: createViteServer } = await import("vite");

  const vite = await createViteServer({
    configFile: false,
    css: {
      postcss: {
        plugins: [
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ((await import("tailwindcss")).default as any)(
            (
              await import(
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                "../tailwind.config.js"
              )
            ).default,
          ),
        ],
      },
    },
    define: {
      "process.env.TRIPLEX_ENV": '"development"',
      "process.env.VITE_TRIPLEX_ENV": '"development"',
    },
    plugins: [
      react({
        babel: {
          plugins: [
            [
              // We need to find the actual path for this plugin. For some reason
              // Babel can't resolve it without it, it might be because of how vsce
              // Runs the project with a different cwd, but I'm not 100% sure.
              require.resolve("babel-plugin-react-compiler"),
              {
                // When we don't support React 18 anymore this can be bumped to 19.
                target: "18",
              },
            ],
          ],
        },
      }),
    ],
    root: join(__dirname, "../"),
    server: {
      headers: {
        "Cross-Origin-Embedder-Policy": "require-corp",
        "Cross-Origin-Opener-Policy": "same-origin",
        "Cross-Origin-Resource-Policy": "cross-origin",
      },
      hmr: {
        path: "/__hmr_dev__",
      },
    },
  });

  return {
    listen: async (port: number) => {
      const server = await vite.listen(port);

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
