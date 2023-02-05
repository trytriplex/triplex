import { Application, isHttpError, Router } from "@oakserver/oak";
import { SyntaxKind } from "ts-morph";
import { join, basename, extname } from "path";
import { readdir } from "./util/fs";
import {
  createProject,
  getJsxAttributeValue,
  getJsxElementPropTypes,
  getAllJsxElements,
} from "@triplex/ts-morph";
import { getParam } from "./util/params";
import { save } from "./services/save";

export function createServer(_: {}) {
  const app = new Application();
  const router = new Router();
  const project = createProject({
    tempDir: join(process.cwd(), ".triplex"),
  });

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

  router.get("/scene/open", async (context) => {
    const path = getParam(context, "path");
    const { sourceFile, transformedPath } = project.getSourceFile(path);

    const jsxElements = sourceFile
      .getDescendantsOfKind(SyntaxKind.JsxElement)
      .map((x) => {
        const { column, line } = sourceFile.getLineAndColumnAtPos(x.getPos());

        return {
          name: x.getOpeningElement().getTagNameNode().getText(),
          line: line - 1,
          column: column - 1,
        };
      });

    const jsxSelfClosing = sourceFile
      .getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement)
      .map((x) => {
        const { column, line } = sourceFile.getLineAndColumnAtPos(x.getPos());

        return {
          name: x.getTagNameNode().getText(),
          line: line - 1,
          column: column - 1,
        };
      });

    context.response.body = {
      transformedPath,
      sceneObjects: jsxElements.concat(jsxSelfClosing),
    };
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

    const props = sceneObject.getAttributes().map((prop) => {
      const { column, line } = sourceFile.getLineAndColumnAtPos(prop.getPos());

      return {
        column: column - 1,
        line: line - 1,
        name: prop.getChildAtIndex(0).getText(),
        value: getJsxAttributeValue(prop),
      };
    });

    const name = sceneObject.getTagNameNode().getText();
    const types = getJsxElementPropTypes(sourceFile, name);

    context.response.body = { name, props, types };
  });

  router.get("/scene/object/:line/:column/prop", (context) => {
    const path = getParam(context, "path");
    const value = getParam(context, "value");
    const name = getParam(context, "name");
    const line = Number(context.params.line);
    const column = Number(context.params.column);
    const { sourceFile } = project.getSourceFile(path);
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

    const attribute = sceneObject
      .getDescendantsOfKind(SyntaxKind.JsxAttribute)
      .find((prop) => prop.getName() === name);

    let action = "";

    if (attribute) {
      attribute.setInitializer(`{${value}}`);
      action = "updated";
    } else {
      sceneObject.addAttribute({
        name,
        initializer: `{${value}}`,
      });
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
    const pos = sourceFile.compilerNode.getPositionOfLineAndCharacter(
      line,
      column
    );
    const attribute = sourceFile
      .getDescendantAtPos(pos)
      ?.getParentIfKind(SyntaxKind.JsxAttribute);

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

  router.get("/scene", async (context) => {
    const files = await readdir(join(process.cwd(), "src"), {
      recursive: true,
    });

    context.response.body = files
      .filter((file) => file.endsWith(".tsx"))
      .map((path) => ({
        path,
        name: basename(path).replace(extname(path), ""),
      }));
  });

  app.use(router.routes());
  app.use(router.allowedMethods());

  return {
    listen: (port = 8000) => app.listen({ port }),
  };
}
