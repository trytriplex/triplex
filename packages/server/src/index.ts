/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { Application, isHttpError, Router } from "@oakserver/oak";
import { watch } from "chokidar";
import { basename } from "node:path";
import {
  createProject,
  getJsxElementAt,
  getJsxElementProps,
  getJsxTag,
  getElementFilePath,
} from "./ast";
import { getParam } from "./util/params";
import { createTWS } from "./util/ws-server";
import { getAllFiles, getSceneExport } from "./services/file";
import * as component from "./services/component";
import * as projectService from "./services/project";
import {
  ComponentTarget,
  ComponentType,
  DeclaredProp,
  ProjectAsset,
  Prop,
} from "./types";
import { getFunctionProps } from "./ast/jsx";

export * from "./types";

export function createServer({
  publicDir,
  assetsDir,
  cwd = process.cwd(),
  files,
  components,
}: {
  publicDir: string;
  assetsDir: string;
  cwd?: string;
  files: string[];
  components: string[];
}) {
  const app = new Application();
  const router = new Router();
  const project = createProject({ cwd });
  const tws = createTWS();

  app.use(async (ctx, next) => {
    try {
      await next();
    } catch (err) {
      if (isHttpError(err)) {
        ctx.response.body = { error: err.message };
        ctx.response.status = 500;
      } else {
        throw err;
      }
    }
  });

  app.use((ctx, next) => {
    ctx.response.headers.set("Access-Control-Allow-Origin", "*");
    return next();
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
    const jsxElement = getJsxElementAt(sourceFile.edit(), line, column);

    if (!jsxElement) {
      context.response.status = 404;
      context.response.body = { message: "Not found" };
      return;
    }

    const action = component.upsertProp(jsxElement, name, value);

    context.response.body = { message: "success", action };
  });

  router.post("/scene/:path/object/:line/:column/delete", (context) => {
    const { column, line, path } = context.params;
    const sourceFile = project.getSourceFile(path);

    component.commentComponent(sourceFile.edit(), Number(line), Number(column));

    context.response.body = { message: "success" };
  });

  router.post("/scene/new", (context) => {
    const exportName = "Untitled";
    const sourceFile = project.createSourceFile(exportName);

    context.response.body = {
      message: "success",
      exportName,
      path: sourceFile.getFilePath(),
    };
  });

  router.post("/scene/:path/new", async (context) => {
    const { path } = context.params;
    const sourceFile = project.getSourceFile(path);

    const { exportName } = component.create(sourceFile.edit());

    context.response.body = { exportName, path };
  });

  router.post("/scene/:path/:exportName", async (context) => {
    const { path, exportName } = context.params;
    const sourceFile = project.getSourceFile(path);
    const body = await context.request.body({ type: "json" }).value;
    const { name: newName } = body as { name: string };

    component.rename(sourceFile.edit(), exportName, newName);

    context.response.body = { message: "success" };
  });

  router.post("/scene/:path/object/:line/:column/restore", (context) => {
    const { column, line, path } = context.params;
    const sourceFile = project.getSourceFile(path);

    component.uncommentComponent(
      sourceFile.edit(),
      Number(line),
      Number(column)
    );

    context.response.body = { message: "success" };
  });

  router.post("/scene/:path/:exportName/object", async (context) => {
    const { exportName, path } = context.params;
    const body = await context.request.body({ type: "json" }).value;
    const { type, target } = body as {
      type: ComponentType;
      target?: ComponentTarget;
    };
    const sourceFile = project.getSourceFile(path);

    const result = component.add(sourceFile.edit(), exportName, type, target);

    context.response.body = { ...result };
  });

  /**
   * Persist the in-memory scene to fs.
   */
  router.post("/project/save", async (context) => {
    const body: { rename: Record<string, string> } = await context.request.body(
      {
        type: "json",
      }
    ).value;

    await project.save(body);

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

  app.use(router.routes());
  app.use(router.allowedMethods());

  const wsRoutesDef = tws.router([
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
        const result = await projectService.foundFolders(components);
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
        const result = await projectService.foundFolders([assetsDir]);
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
        const result = await projectService.folderAssets(
          [assetsDir],
          folderPath
        );

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
          const result = projectService.hostElements();
          return result;
        }

        const result = await projectService.folderComponents(
          components,
          folderPath
        );
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
      async ({ path, exportName }) => {
        const result = await getSceneExport({ path, project, exportName });
        return result;
      },
      async (push, { path }) => {
        const sourceFile = await project.getSourceFile(path);
        sourceFile.read().onModified(push);
      }
    ),
    tws.route(
      "/scene/:path/:exportName/props",
      async ({ path, exportName }) => {
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
    twsDefinition: wsRoutesDef,
    listen: (port = 8000) => {
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
  };
}

export { getConfig } from "./util/config";

export type TWSRouteDefinition = ReturnType<
  typeof createServer
>["twsDefinition"];
