import { Application, isHttpError, Router } from "@oakserver/oak";
import { Node, SyntaxKind } from "ts-morph";
import { join } from "path";
import {
  createProject,
  getJsxAttributeValue,
  getJsxElementPropTypes,
  getAllJsxElements,
} from "@triplex/ts-morph";
import { getParam } from "./util/params";
import { createServer as createWSS } from "./util/ws-server";
import { save } from "./services/save";
import { getAllFiles, getFile } from "./services/file";

import { watch } from "chokidar";
import {
  getAttributes,
  getJsxAttributeAt,
  getJsxElementAt,
  getJsxElementProps,
  getJsxTagName,
} from "@triplex/ts-morph";

export function createServer(_: {}) {
  const app = new Application();
  const router = new Router();
  const project = createProject({
    tempDir: join(process.cwd(), ".triplex"),
  });
  const wss = createWSS();

  app.use(async (ctx, next) => {
    try {
      await next();
    } catch (err) {
      if (isHttpError(err)) {
        ctx.response.body = { error: err.message };
      } else {
        throw err;
      }
    }
  });

  app.use((ctx, next) => {
    ctx.response.headers.set("Access-Control-Allow-Origin", "*");
    return next();
  });

  router.get("/scene/object/:line/:column", (context) => {
    const path = getParam(context, "path");
    const { sourceFile } = project.getSourceFile(path);
    const line = Number(context.params.line);
    const column = Number(context.params.column);
    const pos = sourceFile.compilerNode.getPositionOfLineAndCharacter(
      line,
      column
    );
    const sceneObject = getAllJsxElements(sourceFile).find(
      (node) => node.getPos() === pos
    );

    if (!sceneObject) {
      context.response.status = 404;
      context.response.body = { message: "Not found" };
      return;
    }

    const attributes = getAttributes(sceneObject);
    const props = attributes.map((prop) => {
      const { column, line } = sourceFile.getLineAndColumnAtPos(prop.getPos());

      return {
        column: column - 1,
        line: line - 1,
        name: prop.getChildAtIndex(0).getText(),
        value: getJsxAttributeValue(prop),
      };
    });

    const name = getJsxTagName(sceneObject);
    const types = getJsxElementPropTypes(sourceFile, sceneObject);

    context.response.body = { name, props, types };
  });

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

  router.get("/scene/prop/:line/:column", (context) => {
    const path = getParam(context, "path");
    const value = getParam(context, "value");
    const { sourceFile } = project.getSourceFile(path);
    const line = Number(context.params.line);
    const column = Number(context.params.column);
    const attribute = getJsxAttributeAt(sourceFile, line, column);

    if (!attribute) {
      context.response.status = 404;
      context.response.body = { message: "Not found" };
      return;
    }

    const parsed = JSON.parse(value);

    switch (typeof parsed) {
      case "string":
        attribute.setInitializer(`"${parsed}"`);
        break;

      default:
        attribute.setInitializer(`{${value}}`);
        break;
    }

    context.response.body = { message: "success" };
  });

  router.get("/scene/close", async (context) => {
    const path = getParam(context, "path");

    await project.removeSourceFile(path);

    context.response.body = { message: "success" };
  });

  router.get("/scene/save", async (context) => {
    const path = getParam(context, "path");

    await save({ path, project });

    context.response.body = { message: "success" };
  });

  app.use(router.routes());
  app.use(router.allowedMethods());

  wss.message(
    "/scene",
    async () => {
      const result = await getAllFiles();
      return result;
    },
    (push) => {
      const watcher = watch(join(process.cwd(), "src"));
      watcher.on("add", push);
      watcher.on("unlink", push);
    }
  );

  wss.message(
    "/scene/:path",
    async ({ path }) => {
      const result = await getFile({ path, project });
      return result;
    },
    (push, { path }) => {
      const watcher = watch(path);
      watcher.on("change", push);
    }
  );

  wss.message("/scene/:path/object/:line/:column", (params) => {
    const path = params.path;
    const line = Number(params.line);
    const column = Number(params.column);
    const { sourceFile } = project.getSourceFile(path);
    const sceneObject = getJsxElementAt(sourceFile, line, column);

    if (!sceneObject) {
      throw new Error(`invariant: element not found`);
    }

    const name = getJsxTagName(sceneObject);
    const props = getJsxElementProps(sourceFile, sceneObject);
    const types = getJsxElementPropTypes(sourceFile, sceneObject);

    return { name, props, propTypes: types.propTypes };
  });

  return {
    listen: (port = 8000) => app.listen({ port }),
  };
}
