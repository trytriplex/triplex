import { createServer as createViteServer, Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { join } from "path";
import express from "express";
import { watch } from "chokidar";
import { createHTML } from "./templates";

const root = process.cwd();
const tempFolderName = join("node_modules", ".triplex");
const tempDir = join(process.cwd(), tempFolderName);

function forceGlobsHmr(): Plugin[] {
  const triplexGlobModule = "triplex-scene-glob";

  return [
    {
      name: "triplex/watch-globs",
      configureServer(server) {
        function reloadGlobModule() {
          server.moduleGraph.fileToModulesMap.forEach((mods) => {
            mods.forEach((mod) => {
              if (mod.id?.includes(triplexGlobModule)) {
                server.reloadModule(mod);
              }
            });
          });
        }

        const watcher = watch(tempDir);
        watcher.on("add", reloadGlobModule);
      },
    },
  ];
}

export async function createServer(config: { publicDir?: string }) {
  const app = express();
  const glsl = (await import("vite-plugin-glsl")).default;

  const vite = await createViteServer({
    configFile: false,
    plugins: [(react as any)(), glsl(), forceGlobsHmr()],
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
      const template = createHTML(
        "r3f_scene",
        "/node_modules/@triplex/run/scene"
      );
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
      const template = createHTML(
        "TRIPLEX",
        "/node_modules/@triplex/run/editor"
      );
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
