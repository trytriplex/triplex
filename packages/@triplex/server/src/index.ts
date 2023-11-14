/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { basename } from "node:path";
import { Application, isHttpError, Router } from "@oakserver/oak";
import { watch } from "chokidar";
import {
  createProject,
  getElementFilePath,
  getJsxElementAt,
  getJsxElementProps,
  getJsxTag,
} from "./ast";
import { getFunctionProps, getJsxElementAtOrThrow } from "./ast/jsx";
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
  hostElements,
} from "./services/project";
import {
  ComponentTarget,
  ComponentType,
  DeclaredProp,
  ProjectAsset,
  Prop,
  SourceFileChangedEvent,
} from "./types";
import { getParam } from "./util/params";
import { createTWS } from "./util/ws-server";

export * from "./types";

export function createServer({
  assetsDir,
  components,
  cwd = process.cwd(),
  files,
  publicDir,
}: {
  assetsDir: string;
  components: string[];
  cwd?: string;
  files: string[];
  publicDir: string;
}) {
  const app = new Application();
  const router = new Router();
  const project = createProject({ cwd });
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

  router.post("/scene/:path/object/:line/:column/move", (context) => {
    const destLine = Number(getParam(context, "destLine"));
    const destCol = Number(getParam(context, "destCol"));
    const action = getParam(context, "action") as
      | "move-before"
      | "move-after"
      | "make-child";
    const sourceFile = project.getSourceFile(context.params.path);
    const line = Number(context.params.line);
    const column = Number(context.params.column);

    sourceFile.edit((source) => {
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

    context.response.body = { message: "success" };
  });

  /**
   * Update or add a prop to a jsx element.
   */
  router.get("/scene/object/:line/:column/prop", (context) => {
    const path = getParam(context, "path");
    const value = getParam(context, "value");
    const name = getParam(context, "name");
    const line = Number(context.params.line);
    const column = Number(context.params.column);
    const sourceFile = project.getSourceFile(path);

    const action = sourceFile.edit((source) => {
      const jsxElement = getJsxElementAtOrThrow(source, line, column);
      return upsertProp(jsxElement, name, value);
    });

    context.response.body = { action, message: "success" };
  });

  router.post("/scene/:path/object/:line/:column/duplicate", (context) => {
    const { column, line, path } = context.params;
    const sourceFile = project.getSourceFile(path);

    const result = sourceFile.edit((source) => {
      return duplicate(source, Number(line), Number(column));
    });

    context.response.body = { ...result };
  });

  router.post("/scene/:path/object/:line/:column/delete", (context) => {
    const { column, line, path } = context.params;
    const sourceFile = project.getSourceFile(path);

    sourceFile.edit((source) => {
      commentComponent(source, Number(line), Number(column));
    });

    context.response.body = { message: "success" };
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

    const { exportName } = sourceFile.edit((source) => {
      return create(source);
    });

    context.response.body = { exportName, path };
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
    const sourceFile = project.getSourceFile(path);

    sourceFile.open(exportName);

    context.response.body = { message: "success" };
  });

  router.post("/scene/:path/:exportName", async (context) => {
    const { exportName, path } = context.params;
    const sourceFile = project.getSourceFile(path);
    const body = await context.request.body({ type: "json" }).value;
    const { name: newName } = body as { name: string };

    sourceFile.edit((source) => {
      rename(source, exportName, newName);
    });

    context.response.body = { message: "success" };
  });

  router.post("/scene/:path/object/:line/:column/restore", (context) => {
    const { column, line, path } = context.params;
    const sourceFile = project.getSourceFile(path);

    sourceFile.edit((source) => {
      uncommentComponent(source, Number(line), Number(column));
    });

    context.response.body = { message: "success" };
  });

  router.post("/scene/:path/:exportName/object", async (context) => {
    const { exportName, path } = context.params;
    const body = await context.request.body({ type: "json" }).value;
    const { target, type } = body as {
      target?: ComponentTarget;
      type: ComponentType;
    };
    const sourceFile = project.getSourceFile(path);

    const result = sourceFile.edit((source) => {
      return add(source, exportName, type, target);
    });

    context.response.body = { ...result };
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
        const result = await getAllFiles({ cwd: project.cwd(), files });
        return result;
      },
      (push) => {
        const watcher = watch(files, { ignoreInitial: true });
        watcher.on("add", push);
        watcher.on("change", push);
        watcher.on("unlink", push);
      }
    ),
    tws.route(
      "/scene/components",
      async () => {
        const result = await foundFolders(components);
        return result;
      },
      (push) => {
        const watcher = watch(components);
        watcher.on("addDir", push);
        watcher.on("unlinkDir", push);
        watcher.on("add", push);
        watcher.on("unlink", push);
      }
    ),
    tws.route(
      "/scene/assets",
      async () => {
        const result = await foundFolders([assetsDir]);
        return result;
      },
      (push) => {
        const watcher = watch(assetsDir);
        watcher.on("addDir", push);
        watcher.on("unlinkDir", push);
        watcher.on("add", push);
        watcher.on("unlink", push);
      }
    ),
    tws.route(
      "/scene/assets/:folderPath",
      async ({ folderPath }) => {
        const result = await folderAssets([assetsDir], folderPath);

        const parsed: ProjectAsset[] = result.map((asset) =>
          Object.assign(asset, { path: asset.path.replace(publicDir, "") })
        );

        return parsed;
      },
      (push, { folderPath }) => {
        const watcher = watch(folderPath);
        watcher.on("add", push);
        watcher.on("unlink", push);
      }
    ),
    tws.route(
      "/scene/components/:folderPath",
      async ({ folderPath }) => {
        if (folderPath === "host") {
          const result = hostElements();
          return result;
        }

        const result = await folderComponents(components, folderPath);
        return result;
      },
      (push, { folderPath }) => {
        const watcher = watch(folderPath);
        watcher.on("add", push);
        watcher.on("unlink", push);
      }
    ),
    tws.route("/folder", async () => {
      return { name: basename(cwd) };
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
      "/scene/:path/:exportName",
      async ({ exportName, path }) => {
        const result = await getSceneExport({
          exportName,
          files,
          path,
          project,
        });
        return result;
      },
      async (push, { path }) => {
        const sourceFile = await project.getSourceFile(path);
        sourceFile.read().onModified(push);
      }
    ),
    tws.route(
      "/scene/:path/:exportName/props",
      async ({ exportName, path }) => {
        const sourceFile = await project.getSourceFile(path);
        const props = getFunctionProps(sourceFile.read(), exportName);
        return props;
      },
      async (push, { path }) => {
        const sourceFile = await project.getSourceFile(path);
        sourceFile.read().onModified(push);
        sourceFile.onDependencyModified(push);
      }
    ),
    tws.route(
      "/scene/:path/object/:line/:column",
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
        sourceFile.read().onModified(push);
        sourceFile.onDependencyModified(push);
      }
    ),
  ]);

  return {
    listen: async (port = 8000) => {
      const controller = new AbortController();
      app.listen({ port, signal: controller.signal });

      const close = () => {
        controller.abort();
        tws.close();
      };

      process.once("SIGINT", close);
      process.once("SIGTERM", close);

      return close;
    },
    twsDefinition: wsRoutesDef,
    twsEventsDefinition: wsEventsDef,
  };
}

export { getConfig } from "./util/config";

export type TWSRouteDefinition = ReturnType<
  typeof createServer
>["twsDefinition"];

export type TWSEventDefinition = ReturnType<
  typeof createServer
>["twsEventsDefinition"];
