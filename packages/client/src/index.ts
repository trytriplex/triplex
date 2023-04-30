import react from "@vitejs/plugin-react";
import express from "express";
import { join } from "path";
import openBrowser from "open";
import tsconfigPaths from "vite-tsconfig-paths";
import { scenePlugin } from "./scene-plugin";
import { createHTML } from "./templates";
import triplexBabelPlugin from "./babel-plugin";

export async function createServer({
  components,
  open,
  exportName,
  publicDir,
  files,
  cwd = process.cwd(),
}: {
  cwd?: string;
  components: string[];
  open?: boolean | string;
  exportName?: string;
  publicDir?: string;
  files: string[];
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
      scenePlugin({ cwd, files, components }),
      tsconfigPaths({ projects: [tsConfig] }),
    ],
    root: cwd,
    appType: "custom",
    publicDir,
    logLevel: "error",
    css: {
      postcss: process.env.TRIPLEX_DEV
        ? // PostCSS will only run in TRIPLEX_DEV mode.
          // When built for NPM we use the tailwind CLI and build CSS to dist instead.
          {
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
          }
        : {},
    },
    server: {
      middlewareMode: true,
    },
    resolve: {
      dedupe: ["@react-three/fiber"],
      alias: {
        // TODO: These resolves shouldn't be needed, but without them
        // Vite can't pick them up in the HTML, we probably have some
        // exports/main/module declaration problem in their pkg json.
        "@triplex/editor": require.resolve("@triplex/editor"),
        "@triplex/scene": require.resolve("@triplex/scene"),
        "triplex:styles.css": join(__dirname, "styles.css"),
      },
    },
  });

  app.use(vite.middlewares);

  app.get("/scene.html", async (_, res, next) => {
    try {
      const template = createHTML("Scene", "scene");
      const html = await vite.transformIndexHtml("scene", template);

      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });

  app.get("*", async (_, res, next) => {
    try {
      const template = createHTML("Triplex", "editor");
      const html = await vite.transformIndexHtml("editor", template);

      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });

  return {
    listen: async (port: number) => {
      const server = await app.listen(port);

      if (open) {
        const searchParam = typeof open === "string" ? `?path=${open}` : "";

        await openBrowser(
          `http://localhost:${port}/${searchParam}&exportName=${exportName}`
        );
      }

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
