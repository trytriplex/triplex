import react from "@vitejs/plugin-react";
import express from "express";
import { join } from "path";
import { createHTML } from "./templates";

const root = process.cwd();
const tempFolderName = join("node_modules", ".triplex");
const tempDir = join(process.cwd(), tempFolderName);

export async function createServer(config: { publicDir?: string }) {
  const app = express();
  const { createServer: createViteServer } = await import("vite");

  const vite = await createViteServer({
    configFile: false,
    plugins: [react()],
    publicDir: config.publicDir,
    root,
    appType: "custom",
    // Because this needs to be HMR'd during dev we exclude @triplex/scene from optimization.
    // It has a import.meta.glob() call in it that will be updated when files are added/removed.
    optimizeDeps: { exclude: ["@triplex/run/scene > @triplex/scene"] },
    server: {
      middlewareMode: true,
      watch: {
        ignored: [join("!**", tempFolderName, "**")],
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
