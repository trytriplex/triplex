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
            ).default
          ),
        ],
      },
    },
    plugins: [react()],
    root: join(__dirname, "../"),
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
