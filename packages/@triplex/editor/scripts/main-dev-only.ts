/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { join } from "@triplex/lib/path";

export async function createDevServer(): Promise<{
  listen: (port: number) => Promise<void>;
}> {
  const { createServer: createViteServer } = await import("vite");

  const vite = await createViteServer({
    clearScreen: false,
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
      "process.env.NODE_ENV": '"development"',
    },
    root: join(__dirname, "../"),
  });

  return {
    listen: async (port) => {
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
    },
  };
}
