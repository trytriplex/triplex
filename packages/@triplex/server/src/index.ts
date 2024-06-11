/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { readFile } from "node:fs/promises";
import { Application, isHttpError, Router } from "@oakserver/oak";
import { watch } from "chokidar";
import { basename } from "upath";
import {
  createProject,
  getElementFilePath,
  getJsxElementAt,
  getJsxElementProps,
  getJsxTag,
} from "./ast";
import {
  getFunctionProps,
  getJsxElementAtOrThrow,
  getJsxElementParentExportNameOrThrow,
} from "./ast/jsx";
import {
  add,
  commentComponent,
  create,
  duplicate,
  move,
  rename,
  uncommentComponent,
  upsertProp,
} from "./services/component";
import { getAllFiles, getSceneExport } from "./services/file";
import {
  folderAssets,
  folderComponents,
  foundFolders,
} from "./services/project";
import {
  type ComponentTarget,
  type ComponentType,
  type DeclaredProp,
  type ProjectAsset,
  type Prop,
  type ReconciledTriplexConfig,
  type RendererManifest,
  type SourceFileChangedEvent,
  type TriplexPorts,
} from "./types";
import { getParam } from "./util/params";
import { getThumbnailPath } from "./util/thumbnail";
import { createTWS } from "./util/ws-server";

export * from "./types";

export function createServer({
  config,
  renderer,
}: {
  config: ReconciledTriplexConfig;
  renderer: {
    manifest: RendererManifest;
    path: string;
    root: string;
  };
}) {
  const app = new Application();
  const router = new Router();
  const project = createProject({
    cwd: config.cwd,
    templates: renderer.manifest.templates,
  });
  const tws = createTWS();

  app.use(async (ctx, next) => {
    try {
      await next();
    } catch (error) {
      if (isHttpError(error)) {
        ctx.response.body = { error: error.message };
        ctx.response.status = 500;
      } else {
        throw error;
      }
    }
  });

  app.use((ctx, next) => {
    ctx.response.headers.set("Access-Control-Allow-Origin", "*");
    return next();
  });

  router.get("/healthcheck", (context) => {
    context.response.body = { message: "Healthy", status: 200 };
  });

  router.get("/thumbnail/:path/:exportName", async (context) => {
    const { exportName, path } = context.params;

    const thumbnailPath = await getThumbnailPath({ exportName, path });
    const file = await readFile(thumbnailPath);

    context.response.headers.set("Content-Type", "image/png");
    context.response.body = file;
  });

  router.post("/scene/:path/object/:line/:column/move", async (context) => {
    const destLine = Number(getParam(context, "destLine"));
    const destCol = Number(getParam(context, "destCol"));
    const action = getParam(context, "action") as
      | "move-before"
      | "move-after"
      | "make-child";
    const sourceFile = project.getSourceFile(context.params.path);
    const line = Number(context.params.line);
    const column = Number(context.params.column);

    const [ids] = await sourceFile.edit((source) => {
      move(
        source,
        {
          column,
          line,
        },
        {
          column: destCol,
          line: destLine,
        },
        action
      );
    });

    context.response.body = { message: "success", ...ids };
  });

  /**
   * Update or add a prop to a jsx element.
   */
  router.get("/scene/object/:line/:column/prop", async (context) => {
    const path = getParam(context, "path");
    const value = getParam(context, "value");
    const name = getParam(context, "name");
    const line = Number(context.params.line);
    const column = Number(context.params.column);
    const sourceFile = project.getSourceFile(path);

    const [ids, result] = await sourceFile.edit((source) => {
      const jsxElement = getJsxElementAtOrThrow(source, line, column);
      const action = upsertProp(jsxElement, name, value);

      return {
        action,
        node: jsxElement,
      };
    });

    const parentExportName = getJsxElementParentExportNameOrThrow(result.node);
    sourceFile.open(parentExportName);

    context.response.body = {
      ...ids,
      action: result.action,
      message: "success",
    };
  });

  router.post("/scene/:path/undo/:id?", (context) => {
    const { id, path } = context.params;
    const sourceFile = project.getSourceFile(path);

    sourceFile.undo(id ? Number(id) : undefined);

    context.response.body = { message: "success" };
  });

  router.post("/scene/:path/redo/:id?", (context) => {
    const { id, path } = context.params;
    const sourceFile = project.getSourceFile(path);

    sourceFile.redo(id ? Number(id) : undefined);

    context.response.body = { message: "success" };
  });

  router.post(
    "/scene/:path/object/:line/:column/duplicate",
    async (context) => {
      const { column, line, path } = context.params;
      const sourceFile = project.getSourceFile(path);

      const [ids, result] = await sourceFile.edit((source) => {
        return duplicate(source, Number(line), Number(column));
      });

      context.response.body = { ...result, ...ids };
    }
  );

  router.post("/scene/:path/object/:line/:column/delete", async (context) => {
    const { column, line, path } = context.params;
    const sourceFile = project.getSourceFile(path);

    const [ids] = await sourceFile.edit((source) => {
      commentComponent(source, Number(line), Number(column));
    });

    context.response.body = { message: "success", ...ids };
  });

  router.post("/scene/new", (context) => {
    const exportName = "Untitled";
    const sourceFile = project.createSourceFile(exportName);

    sourceFile.open(exportName);

    context.response.body = {
      exportName,
      message: "success",
      path: sourceFile.read().getFilePath(),
    };
  });

  router.post("/scene/:path/new", async (context) => {
    const { path } = context.params;
    const sourceFile = project.getSourceFile(path);

    const [ids, { exportName }] = await sourceFile.edit((source) => {
      return create(source, renderer.manifest.templates.newElements);
    });

    context.response.body = {
      exportName,
      path,
      redoID: ids.redoID,
      undoID: ids.undoID,
    };
  });

  router.post("/scene/:path/save", async (context) => {
    const { path } = context.params;
    const sourceFile = project.getSourceFile(path);

    const result = await sourceFile.save();

    if (result) {
      context.response.body = { error: result, message: "error" };
    } else {
      context.response.body = { message: "success" };
    }
  });

  router.post("/scene/:path/save-as", async (context) => {
    const { path } = context.params;
    const newPath = getParam(context, "newPath");
    const sourceFile = project.getSourceFile(path);

    await sourceFile.save(newPath);

    context.response.body = { message: "success" };
  });

  router.get("/scene/:path/:exportName/open", async (context) => {
    const { exportName, path } = context.params;
    const index = getParam(context, "index");
    const sourceFile = project.getSourceFile(path);
    const parsedIndex = Number(index);

    sourceFile.open(exportName, parsedIndex);

    context.response.body = { message: "success" };
  });

  router.post("/scene/:path/:exportName", async (context) => {
    const { exportName, path } = context.params;
    const sourceFile = project.getSourceFile(path);
    const body = await context.request.body({ type: "json" }).value;
    const { name: newName } = body as { name: string };

    const [ids] = await sourceFile.edit((source) => {
      rename(source, exportName, newName);
    });

    context.response.body = { message: "success", ...ids };
  });

  router.post("/scene/:path/object/:line/:column/restore", async (context) => {
    const { column, line, path } = context.params;
    const sourceFile = project.getSourceFile(path);

    const [ids] = await sourceFile.edit((source) => {
      uncommentComponent(source, Number(line), Number(column));
    });

    context.response.body = { message: "success", ...ids };
  });

  router.post("/scene/:path/:exportName/object", async (context) => {
    const { exportName, path } = context.params;
    const body = await context.request.body({ type: "json" }).value;
    const { target, type } = body as {
      target?: ComponentTarget;
      type: ComponentType;
    };
    const sourceFile = project.getSourceFile(path);

    const [ids, result] = await sourceFile.edit((source) => {
      return add(source, exportName, type, target);
    });

    context.response.body = { ...result, ...ids };
  });

  router.post("/project/save-all", async (context) => {
    await project.saveAll();

    context.response.body = { message: "success" };
  });

  /**
   * Resets the scene to what is currently saved to fs.
   */
  router.get("/scene/:path/reset", async (context) => {
    const path = context.params.path;
    const sourceFile = await project.getSourceFile(path);

    await sourceFile.reset();

    context.response.body = { message: "success" };
  });

  router.get("/scene/:path/close", async (context) => {
    const path = context.params.path;
    const sourceFile = await project.getSourceFile(path);

    await sourceFile.close();

    context.response.body = { message: "success" };
  });

  router.get("/fs/:path", async (context) => {
    const path = context.params.path;
    const sourceFile = await project.getSourceFile(path);

    context.response.body = sourceFile.read().getFullText();
  });

  app.use(router.routes());
  app.use(router.allowedMethods());

  const wsEventsDef = tws.collectTypes([
    tws.createEvent<"fs-change", SourceFileChangedEvent>(
      "fs-change",
      (sendEvent) => {
        project.onSourceFileChange((e) => {
          sendEvent(e);
        });
      }
    ),
  ]);

  const wsRoutesDef = tws.collectTypes([
    tws.route(
      "/scene",
      async () => {
        const result = await getAllFiles({
          cwd: project.cwd(),
          files: config.files,
        });
        return result;
      },
      (push) => {
        const watcher = watch(config.files, {
          ignoreInitial: true,
          ignored: /node_modules/,
        });
        watcher.on("add", push);
        watcher.on("change", push);
        watcher.on("unlink", push);
      }
    ),
    tws.route(
      "/scene/components",
      async () => {
        const result = await foundFolders(config.components);
        return result;
      },
      (push) => {
        const watcher = watch(config.components, { ignored: /node_modules/ });
        watcher.on("addDir", push);
        watcher.on("unlinkDir", push);
        watcher.on("add", push);
        watcher.on("unlink", push);
      }
    ),
    tws.route(
      "/scene/assets",
      async () => {
        const result = await foundFolders([config.assetsDir]);
        return result;
      },
      (push) => {
        const watcher = watch(config.assetsDir, { ignored: /node_modules/ });
        watcher.on("addDir", push);
        watcher.on("unlinkDir", push);
        watcher.on("add", push);
        watcher.on("unlink", push);
      }
    ),
    tws.route(
      "/scene/assets/:folderPath",
      async ({ folderPath }) => {
        const result = await folderAssets([config.assetsDir], folderPath);

        const parsed: ProjectAsset[] = result.map((asset) =>
          Object.assign(asset, {
            path: asset.path.replace(config.publicDir, ""),
          })
        );

        return parsed;
      },
      (push, { folderPath }) => {
        const watcher = watch(folderPath, { ignored: /node_modules/ });
        watcher.on("add", push);
        watcher.on("unlink", push);
      }
    ),
    tws.route(
      "/scene/components/:folderPath",
      async ({ folderPath }) => {
        if (folderPath === "host") {
          const result = renderer.manifest.assets.hostElements;
          return result;
        }

        const result = await folderComponents(config.components, folderPath);
        return result;
      },
      (push, { folderPath }) => {
        const watcher = watch(folderPath, { ignored: /node_modules/ });
        watcher.on("add", push);
        watcher.on("unlink", push);
      }
    ),
    tws.route("/folder", async () => {
      return { name: basename(config.cwd) };
    }),
    tws.route(
      "/project/state",
      async () => {
        return project.getState();
      },
      async (push) => {
        project.onStateChange(push);
      }
    ),
    tws.route(
      { defer: true, path: "/scene/:path/:exportName" },
      async ({ exportName, path }) => {
        const result = await getSceneExport({
          exportName,
          files: config.files,
          path,
          project,
        });
        return result;
      },
      async (push, { path }) => {
        const sourceFile = await project.getSourceFile(path);
        sourceFile.onModified(push);
      }
    ),
    tws.route(
      { defer: true, path: "/scene/:path/:exportName/props" },
      async ({ exportName, path }) => {
        const sourceFile = await project.getSourceFile(path);
        const props = getFunctionProps(sourceFile.read(), exportName);
        return props;
      },
      async (push, { path }) => {
        const sourceFile = await project.getSourceFile(path);
        sourceFile.onModified(push);
        sourceFile.onDependencyModified(push);
      }
    ),
    tws.route(
      { defer: true, path: "/scene/:path/object/:line/:column" },
      (params, { type }) => {
        const path = params.path;
        const line = Number(params.line);
        const column = Number(params.column);
        const sourceFile = project.getSourceFile(path);
        const sceneObject = getJsxElementAt(sourceFile.read(), line, column);

        if (!sceneObject) {
          if (type === "pull") {
            // Initial request - throw an error.
            throw new Error(
              `invariant: component at ${line}:${column} not found`
            );
          } else {
            return {
              name: "[deleted]",
              props: [] as (Prop | DeclaredProp)[],
              transforms: { rotate: false, scale: false, translate: false },
              type: "host",
            } as const;
          }
        }

        const tag = getJsxTag(sceneObject);
        const { props, transforms } = getJsxElementProps(
          sourceFile.read(),
          sceneObject
        );

        if (tag.type === "custom") {
          const elementPath = getElementFilePath(sceneObject);

          return {
            exportName: elementPath.exportName,
            name: tag.tagName,
            path: elementPath.filePath,
            props,
            transforms,
            type: tag.type,
          };
        }

        return {
          name: tag.tagName,
          props,
          transforms,
          type: tag.type,
        } as const;
      },
      async (push, { path }) => {
        const sourceFile = await project.getSourceFile(path);
        sourceFile.onModified(push);
        sourceFile.onDependencyModified(push);
      }
    ),
  ]);

  return {
    listen: async (ports: TriplexPorts) => {
      const controller = new AbortController();
      app.listen({ port: ports.server, signal: controller.signal });
      tws.listen(ports.ws);

      const close = () => {
        try {
          controller.abort();
          tws.close();
        } finally {
          process.exit(0);
        }
      };

      process.once("SIGINT", close);
      process.once("SIGTERM", close);

      return close;
    },
    twsDefinition: wsRoutesDef,
    twsEventsDefinition: wsEventsDef,
  };
}

export { getConfig, resolveProjectCwd } from "./util/config";
export { inferExports } from "./util/module";
export { getRendererMeta } from "./util/renderer";

export type TWSRouteDefinition = ReturnType<
  typeof createServer
>["twsDefinition"];

export type TWSEventDefinition = ReturnType<
  typeof createServer
>["twsEventsDefinition"];
