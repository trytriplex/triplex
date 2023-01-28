import react from "@vitejs/plugin-react";
import express from "express";
import { join } from "path";
import { createServer as createViteServer } from "vite";
import { createHTML } from "./templates";

const root = process.cwd();
const tempFolderName = join("node_modules", ".triplex");
const tempDir = join(process.cwd(), tempFolderName);

export async function createServer(config: { publicDir?: string }) {
  const app = express();
  const glsl = (await import("vite-plugin-glsl")).default;

  const vite = await createViteServer({
    configFile: false,
    plugins: [(react as any)(), glsl()],
    publicDir: config.publicDir,
    root,
    appType: "custom",
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
