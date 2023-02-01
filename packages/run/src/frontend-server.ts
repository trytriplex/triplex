import react from "@vitejs/plugin-react";
import express from "express";
import { join } from "path";
import { scenePlugin } from "./scene-plugin";
import { createHTML } from "./templates";

const root = process.cwd();
const tempDir = join(process.cwd(), "node_modules", ".triplex");

export async function createServer({}) {
  const app = express();
  const { createServer: createViteServer } = await import("vite");

  const vite = await createViteServer({
    configFile: false,
    plugins: [react(), scenePlugin({ tempDir })],
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
        "@@": tempDir,
      },
    },
  });

  app.use(vite.middlewares);

  app.get("/scene.html", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const template = createHTML("r3f_scene", "scene");
      const html = await vite.transformIndexHtml(url, template);

      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });

  app.get("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const template = createHTML("TRIPLEX", "editor");
      const html = await vite.transformIndexHtml(url, template);

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
