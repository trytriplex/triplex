import { Application, isHttpError, Router } from "@oakserver/oak";
import { Node, SyntaxKind } from "ts-morph";
import { watch } from "chokidar";
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

export function createServer({ files }: { files: string[] }) {
  const app = new Application();
  const router = new Router();
  const project = createProject();
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
    const sceneObject = getJsxElementAt(sourceFile, line, column);

    if (!sceneObject) {
      context.response.status = 404;
      context.response.body = { message: "Not found" };
      return;
    }

    const attribute = sceneObject
      .getDescendantsOfKind(SyntaxKind.JsxAttribute)
      .find((prop) => prop.getName() === name);

    let action = "";

    if (attribute) {
      attribute.setInitializer(`{${value}}`);
      action = "updated";
    } else {
      const newAttribute = {
        name,
        initializer: `{${value}}`,
      };

      if (Node.isJsxElement(sceneObject)) {
        sceneObject.getOpeningElement().addAttribute(newAttribute);
      } else {
        sceneObject.addAttribute(newAttribute);
      }

      action = "added";
    }

    context.response.body = { message: "success", action };
  });

  /**
   * Persist the in-memory scene to fs.
   */
  router.get("/scene/:path/save", async (context) => {
    const path = context.params.path;

    await save({ path, project });

    context.response.body = { message: "success" };
  });

  /**
   * Resets the scene to what is currently saved to fs.
   */
  router.get("/scene/:path/reset", async (context) => {
    const path = context.params.path;
    const { sourceFile } = await project.getSourceFile(path);

    await sourceFile.refreshFromFileSystem();
    await save({ path, project });

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
      const result = await getAllFiles({ files });
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

      // When saved
      const watcher = watch(path);
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
            propTypes: [],
            type: "host",
          };
        }
      }

      const tag = getJsxTag(sceneObject);
      const props = getJsxElementProps(sourceFile, sceneObject);
      const propTypes = getJsxElementPropTypes(sceneObject);

      if (tag.type === "custom") {
        const elementPath = getElementFilePath(sceneObject);
        const rotate: boolean = !!propTypes.rotation;
        const scale: boolean = !!propTypes.scale;
        const translate: boolean = !!propTypes.position;

        return {
          exportName: elementPath.exportName,
          name: tag.name,
          path: elementPath.filePath,
          props,
          propTypes,
          rotate,
          scale,
          translate,
          type: tag.type,
        };
      }

      return {
        name: tag.name,
        props,
        propTypes,
        rotate: true,
        scale: true,
        translate: true,
        type: tag.type,
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
      const promise = app.listen({ port, signal: controller.signal });

      const close = () => {
        controller.abort();
        wss.close();
      };

      process.once("SIGINT", close);
      process.once("SIGTERM", close);

      return promise;
    },
  };
}
