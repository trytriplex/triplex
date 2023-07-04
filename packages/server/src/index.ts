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
  getJsxElementPropTypes,
  getJsxElementAt,
  getJsxElementProps,
  getJsxTag,
  getElementFilePath,
} from "./ast";
import { getParam } from "./util/params";
import { createServer as createWSS } from "./util/ws-server";
import { save } from "./services/save";
import { getAllFiles, getSceneExport } from "./services/file";
import * as component from "./services/component";
import * as projectService from "./services/project";
import { ComponentTarget, ComponentType } from "./types";

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
  const wss = createWSS();

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
    const { sourceFile } = project.getSourceFile(path);
    const jsxElement = getJsxElementAt(sourceFile, line, column);

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
    const { sourceFile } = project.getSourceFile(path);

    component.commentComponent(sourceFile, Number(line), Number(column));

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
    const { sourceFile } = project.getSourceFile(path);

    const { exportName } = component.create(sourceFile);

    context.response.body = { exportName, path };
  });

  router.post("/scene/:path/:exportName", async (context) => {
    const { path, exportName } = context.params;
    const { sourceFile } = project.getSourceFile(path);
    const { name: newName } = (await context.request.body({ type: "json" })
      .value) as {
      name: string;
    };

    component.rename(sourceFile, exportName, newName);

    context.response.body = { message: "success" };
  });

  router.post("/scene/:path/object/:line/:column/restore", (context) => {
    const { column, line, path } = context.params;
    const { sourceFile } = project.getSourceFile(path);

    component.uncommentComponent(sourceFile, Number(line), Number(column));

    context.response.body = { message: "success" };
  });

  router.post("/scene/:path/:exportName/object", async (context) => {
    const { exportName, path } = context.params;
    const { type, target } = (await context.request.body({ type: "json" })
      .value) as {
      type: ComponentType;
      target?: ComponentTarget;
    };
    const { sourceFile } = project.getSourceFile(path);

    const result = component.add(sourceFile, exportName, type, target);

    context.response.body = { ...result };
  });

  /**
   * Persist the in-memory scene to fs.
   */
  router.get("/scene/:path/save", async (context) => {
    const path = context.params.path;
    const newPath =
      context.request.url.searchParams.get("newPath") || undefined;

    await save({ path, project, newPath });

    context.response.body = { message: "success" };
  });

  /**
   * Resets the scene to what is currently saved to fs.
   */
  router.get("/scene/:path/reset", async (context) => {
    const path = context.params.path;
    const { sourceFile } = await project.getSourceFile(path);

    await sourceFile.refreshFromFileSystem();

    context.response.body = { message: "success" };
  });

  app.use(router.routes());
  app.use(router.allowedMethods());

  /**
   * Return all found scene files in a project.
   */
  wss.message(
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
  );

  wss.message(
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
  );

  wss.message(
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
  );

  wss.message(
    "/scene/assets/:folderPath",
    async ({ folderPath }) => {
      const result = await projectService.folderAssets([assetsDir], folderPath);
      return result.map((asset) =>
        Object.assign(asset, { path: asset.path.replace(publicDir, "") })
      );
    },
    (push, { folderPath }) => {
      const watcher = watch(folderPath);
      watcher.on("add", push);
      watcher.on("unlink", push);
    }
  );

  wss.message("/scene/components/host", async () => {
    const result = projectService.hostElements();
    return result;
  });

  wss.message(
    "/scene/components/:folderPath",
    async ({ folderPath }) => {
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
  );

  wss.message("/folder", async () => {
    return { name: basename(cwd) };
  });

  wss.message(
    "/scene/:path",
    async ({ path }) => {
      const { sourceFile } = await project.getSourceFile(path);
      const isSaved = sourceFile.isSaved();
      return { isSaved };
    },
    async (push, { path }) => {
      // When modified
      const { sourceFile } = await project.getSourceFile(path);
      sourceFile.onModified(push);

      // When running on windows there is a timing issue where the saved indicator
      // Never gets unset after a save. Using polling alleviates this but isn't an
      // Ideal solution. Watch out for a better one, for example moving to watchman.
      const watcher = watch(path, { usePolling: process.platform === "win32" });
      // When saved (fs change event) we push an update to connected clients.
      watcher.on("change", push);
    }
  );

  /**
   * Return details about a scene.
   */
  wss.message(
    "/scene/:path/:exportName",
    async ({ path, exportName }) => {
      const result = await getSceneExport({ path, project, exportName });
      return result;
    },
    async (push, { path }) => {
      const { sourceFile } = await project.getSourceFile(path);
      sourceFile.onModified(push);
    }
  );

  /**
   * Return details about a jsx element inside a scene.
   */
  wss.message(
    "/scene/:path/object/:line/:column",
    (params, { type }) => {
      const path = params.path;
      const line = Number(params.line);
      const column = Number(params.column);
      const { sourceFile } = project.getSourceFile(path);
      const sceneObject = getJsxElementAt(sourceFile, line, column);

      if (!sceneObject) {
        if (type === "pull") {
          // Initial request - throw an error.
          throw new Error(
            `invariant: component at ${line}:${column} not found`
          );
        } else {
          return {
            name: "[deleted]",
            props: [],
            type: "host",
          };
        }
      }

      const tag = getJsxTag(sceneObject);
      const props = getJsxElementProps(sourceFile, sceneObject);

      if (tag.type === "custom") {
        const elementPath = getElementFilePath(sceneObject);

        return {
          exportName: elementPath.exportName,
          name: tag.name,
          path: elementPath.filePath,
          props,
          type: tag.type,
        };
      }

      return {
        name: tag.name,
        props,
        type: tag.type,
      };
    },
    async (push, { path }) => {
      const { sourceFile, onDependencyModified } = await project.getSourceFile(
        path
      );
      sourceFile.onModified(push);
      onDependencyModified(push);
    }
  );

  /**
   * Return type information for a jsx element.
   */
  wss.message(
    "/scene/:path/object/:line/:column/types",
    (params, { type }) => {
      const path = params.path;
      const line = Number(params.line);
      const column = Number(params.column);
      const { sourceFile } = project.getSourceFile(path);
      const sceneObject = getJsxElementAt(sourceFile, line, column);

      if (!sceneObject) {
        if (type === "pull") {
          // Initial request - throw an error.
          throw new Error(
            `invariant: component at ${line}:${column} not found`
          );
        } else {
          return {
            propTypes: {},
            transforms: {
              rotate: false,
              scale: false,
              translate: false,
            },
          };
        }
      }

      const propTypes = getJsxElementPropTypes(sceneObject);

      return {
        propTypes: propTypes.propTypes,
        transforms: propTypes.transforms,
      };
    },
    async (push, { path }) => {
      const { sourceFile } = await project.getSourceFile(path);
      sourceFile.onModified(push);
    }
  );

  return {
    listen: (port = 8000) => {
      const controller = new AbortController();
      app.listen({ port, signal: controller.signal });

      const close = () => {
        controller.abort();
        wss.close();
      };

      process.once("SIGINT", close);
      process.once("SIGTERM", close);

      return close;
    },
  };
}

export { getConfig } from "./util/config";
