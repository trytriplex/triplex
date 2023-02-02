import react from "@vitejs/plugin-react";
import express from "express";
import { join } from "path";
import { scenePlugin } from "./scene-plugin";
import { createHTML } from "./templates";

const root = process.cwd();
const tempDir = join(process.cwd(), ".triplex");

export async function createServer({}) {
  const app = express();
  const { createServer: createViteServer } = await import("vite");

  const vite = await createViteServer({
    configFile: false,
    plugins: [react(), scenePlugin()],
    root,
    appType: "custom",
    server: {
      middlewareMode: true,
      watch: {
        ignored: ["!**/.triplex/**"],
      },
    },
    resolve: {
      alias: {
        // TODO: These resolves shouldn't be needed, but without them
        // Vite can't pick them up in the HTML, we probably have some
        // exports/main/module declaration problem in their pkg json.
        "@triplex/editor": require.resolve("@triplex/editor"),
        "@triplex/scene": require.resolve("@triplex/scene"),
        "@@": tempDir,
      },
    },
  });

  app.use(vite.middlewares);

  app.get("/scene.html", async (_, res, next) => {
    try {
      const template = createHTML("r3f_scene", "scene");
      const html = await vite.transformIndexHtml("scene", template);

      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });

  app.get("*", async (_, res, next) => {
    try {
      const template = createHTML("TRIPLEX", "editor");
      const html = await vite.transformIndexHtml("editor", template);

      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });

  return {
    listen: (port: number) => app.listen(port),
  };
}
