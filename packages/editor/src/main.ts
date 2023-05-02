import { join } from "path";

export async function createDevServer(): Promise<{
  listen: (port: number) => Promise<void>;
}> {
  const { createServer: createViteServer } = await import("vite");

  const vite = await createViteServer({
    clearScreen: false,
    root: join(__dirname, "../"),
    css: {
      postcss: {
        plugins: [
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ((await import("tailwindcss")).default as any)(
            (
              await import(
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                "../tailwind.config.js"
              )
            ).default
          ),
        ],
      },
    },
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
