import {
  Application,
  HttpError,
  isHttpError,
  Router,
  RouterContext,
} from "@oakserver/oak";
import {
  FileSystemRefreshResult,
  JsxAttributeLike,
  JsxOpeningElement,
  JsxSelfClosingElement,
  Project,
  SourceFile,
  SyntaxKind,
  TransformTraversalControl,
  ts,
  Type,
  VariableDeclarationKind,
} from "ts-morph";
import * as posixPath from "path/posix";
import { watch, rm as remove, FileChangeInfo } from "fs/promises";

interface FsWatcher {
  iterable: AsyncIterable<FileChangeInfo<string>>;
  abort: () => void;
}

export function createServer(config: { tsConfigFilePath?: string }) {
  let cwd = "";

  const app = new Application();
  const router = new Router();

  const project = new Project({
    tsConfigFilePath: config.tsConfigFilePath,
  });

  const sourceFiles = new Map<
    string,
    {
      watcher: FsWatcher;
      transformedPath: string;
    }
  >();
  const transformedFilesPath = () =>
    posixPath.join(process.cwd(), "node_modules", ".triplex");

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

  async function watchSourceFile(sourceFile: SourceFile, watcher: FsWatcher) {
    for await (const event of watcher.iterable) {
      if (event.eventType === "change") {
        const result = sourceFile.refreshFromFileSystemSync();
        if (
          result === FileSystemRefreshResult.Updated &&
          // TODO: Hack - there is a race condition somewhere.
          // This ensures the file doesn't get blown away unexpectedly.
          sourceFile.getText().trim()
        ) {
          transformSouceFileSync(sourceFile);
        }
      }
    }
  }

  function getParam(context: RouterContext<any, any>, key: string) {
    const path = context.request.url.searchParams.get(key);
    if (!path) {
      throw new HttpError(`Missing [${key}] search param`);
    }

    return path;
  }

  function getJsxAttributeValue(prop: JsxAttributeLike) {
    const expression = prop
      .getChildrenOfKind(SyntaxKind.JsxExpression)[0]
      ?.getExpression();
    let result = "undefined";

    if (expression) {
      result = expression
        .getFullText()
        .replace(/\n| /g, "")
        .replace(/(,)(}|])/g, (match) => match.replace(",", ""));
    }

    const stringLiteral = prop.getChildrenOfKind(SyntaxKind.StringLiteral)[0];
    if (stringLiteral) {
      result = stringLiteral.getText();
    }

    try {
      return JSON.parse(result);
    } catch (_e) {
      return result;
    }
  }

  function unrollType(type: Type, _nested = false): any {
    const args = type.getTypeArguments();
    if (args.length) {
      return args.map((arg) => unrollType(arg, true)) as string[];
    }

    if (type.isUnion()) {
      // From the boolean hack above it will return two
      const types = type
        .getUnionTypes()
        .filter((type) => !type.isUndefined())
        .map((n) => {
          const value = unrollType(n, true);

          if (n.isTuple()) {
            return {
              kind: "tuple",
              value,
            };
          }

          if (n.isArray()) {
            return {
              kind: "array",
              value,
            };
          }

          return {
            kind: "type",
            value,
          };
        });

      if (types.length === 1) {
        return types[0];
      }

      return {
        kind: "union",
        type: types.map((type) => type.value),
      };
    }

    if (_nested) {
      return type.getText();
    }

    return {
      kind: "type",
      value: type.getText(),
    };
  }

  function getJsxElementMeta(sourceFile: SourceFile, elementName: string) {
    const propTypes: Record<
      string,
      { name: string; required: boolean; type: any }
    > = {};

    if (/[a-z]/.exec(elementName[0])) {
      return {
        filePath: "",
        propTypes,
      };
    }

    try {
      const symbol = sourceFile.getLocalOrThrow(elementName);
      const componentFunction = symbol
        .getDeclarations()[0]
        .asKindOrThrow(SyntaxKind.ImportSpecifier)
        .getType()
        .getSymbolOrThrow()
        .getDeclarations()[0]
        .asKindOrThrow(SyntaxKind.FunctionDeclaration);

      const [props] = componentFunction.getParameters();
      const filePath = componentFunction.getSourceFile().getFilePath();

      props
        .getType()
        .getProperties()
        .forEach((prop) => {
          propTypes[prop.getName()] = {
            name: prop.getName(),
            required: !prop.isOptional(),
            type: unrollType(prop.getTypeAtLocation(componentFunction)),
          };
        });

      return {
        filePath,
        propTypes,
      };
    } catch (_) {
      return {
        filePath: "",
        propTypes,
      };
    }
  }

  function getNodeTransforms(sourceFile: SourceFile, elementName: string) {
    if (/[a-z]/.exec(elementName[0])) {
      return {
        translate: true,
        scale: true,
        rotate: true,
      };
    }

    const meta = getJsxElementMeta(sourceFile, elementName);

    return {
      filePath: meta.filePath,
      translate: !!meta.propTypes.position,
      scale: !!meta.propTypes.scale,
      rotate: !!meta.propTypes.rotation,
    };
  }

  const exclude = ["Material", "Geometry"];
  function isSceneObject(
    node: ts.Node
  ): node is ts.JsxSelfClosingElement | ts.JsxElement {
    if (
      ts.isJsxSelfClosingElement(node) &&
      !exclude.find((n) => node.tagName.getText().includes(n))
    ) {
      return true;
    }

    if (
      ts.isJsxElement(node) &&
      !exclude.find((n) => node.openingElement.tagName.getText().includes(n))
    ) {
      return true;
    }

    return false;
  }

  function serializeProps(
    traversal: TransformTraversalControl,
    attributes: ts.JsxAttributes
  ): ts.ObjectLiteralExpression {
    return traversal.factory.createObjectLiteralExpression(
      attributes.properties.map((prop) => {
        if (prop.kind === SyntaxKind.JsxSpreadAttribute) {
          return traversal.factory.createSpreadAssignment(prop.expression);
        }

        let value: ts.Expression;

        if (!prop.initializer) {
          // Implict true
          value = traversal.factory.createTrue();
        } else {
          switch (prop.initializer.kind) {
            case SyntaxKind.StringLiteral:
              value = prop.initializer;
              break;

            case SyntaxKind.JsxExpression:
              value = prop.initializer.expression!;
              break;

            case SyntaxKind.JsxElement:
            case SyntaxKind.JsxSelfClosingElement:
            case SyntaxKind.JsxFragment:
              throw new HttpError(
                `Unsupported syntax [${prop.initializer.kind}]`
              );
          }
        }

        return traversal.factory.createPropertyAssignment(prop.name, value);
      })
    );
  }

  function transformSouceFileSync(sourceFile: SourceFile) {
    // This will be the final destination persisted to the file system picked up by the Editor.
    const destination = posixPath.join(
      transformedFilesPath(),
      sourceFile.getFilePath()
    );

    // This is a temporary destination so we can copy the source file and keep
    // node positions the same while transforming them.
    const tempDestination = posixPath.join(transformedFilesPath(), "/temp.tsx");
    const transformedSource = sourceFile.copy(tempDestination, {
      overwrite: true,
    });

    let customLighting = false;

    transformedSource.transform((traversal) => {
      const node = traversal.visitChildren();
      const lineColumn = transformedSource.getLineAndColumnAtPos(node.pos);
      const line = lineColumn.line - 1;
      const column = lineColumn.column - 1;

      if (!isSceneObject(node)) {
        return node;
      }

      if (ts.isJsxSelfClosingElement(node)) {
        if (node.tagName.getText().includes("Light")) {
          customLighting = true;
        }

        const transform = getNodeTransforms(
          transformedSource,
          node.tagName.getText()
        );

        return traversal.factory.createJsxElement(
          traversal.factory.createJsxOpeningElement(
            traversal.factory.createIdentifier("group"),
            [],
            traversal.factory.createJsxAttributes(
              [
                node.attributes.properties.find(
                  (x) => x.name?.getText() === "key"
                ),
                traversal.factory.createJsxAttribute(
                  traversal.factory.createIdentifier("userData"),
                  traversal.factory.createJsxExpression(
                    undefined,
                    traversal.factory.createObjectLiteralExpression([
                      traversal.factory.createPropertyAssignment(
                        "__r3fEditor",
                        traversal.factory.createObjectLiteralExpression([
                          traversal.factory.createPropertyAssignment(
                            "path",
                            traversal.factory.createStringLiteral(
                              transform.filePath || ""
                            )
                          ),
                          traversal.factory.createPropertyAssignment(
                            "line",
                            traversal.factory.createNumericLiteral(line)
                          ),
                          traversal.factory.createPropertyAssignment(
                            "column",
                            traversal.factory.createNumericLiteral(column)
                          ),
                          traversal.factory.createPropertyAssignment(
                            "props",
                            serializeProps(traversal, node.attributes)
                          ),
                          traversal.factory.createPropertyAssignment(
                            "translate",
                            transform.translate
                              ? traversal.factory.createTrue()
                              : traversal.factory.createFalse()
                          ),
                          traversal.factory.createPropertyAssignment(
                            "rotate",
                            transform.rotate
                              ? traversal.factory.createTrue()
                              : traversal.factory.createFalse()
                          ),
                          traversal.factory.createPropertyAssignment(
                            "scale",
                            transform.scale
                              ? traversal.factory.createTrue()
                              : traversal.factory.createFalse()
                          ),
                        ])
                      ),
                    ])
                  )
                ),
              ].filter(Boolean) as ts.JsxAttributeLike[]
            )
          ),
          [node],
          traversal.factory.createJsxClosingElement(
            traversal.factory.createIdentifier("group")
          )
        );
      }

      if (ts.isJsxElement(node)) {
        if (node.openingElement.tagName.getText().includes("Light")) {
          customLighting = true;
        }

        const transform = getNodeTransforms(
          transformedSource,
          node.openingElement.tagName.getText()
        );

        return traversal.factory.updateJsxElement(
          node,
          traversal.factory.createJsxOpeningElement(
            traversal.factory.createIdentifier("group"),
            [],
            traversal.factory.createJsxAttributes([
              traversal.factory.createJsxAttribute(
                traversal.factory.createIdentifier("userData"),
                traversal.factory.createJsxExpression(
                  undefined,
                  traversal.factory.createObjectLiteralExpression([
                    traversal.factory.createPropertyAssignment(
                      "__r3fEditor",
                      traversal.factory.createObjectLiteralExpression([
                        traversal.factory.createPropertyAssignment(
                          "path",
                          traversal.factory.createStringLiteral(
                            transform.filePath || ""
                          )
                        ),
                        traversal.factory.createPropertyAssignment(
                          "line",
                          traversal.factory.createNumericLiteral(line)
                        ),
                        traversal.factory.createPropertyAssignment(
                          "column",
                          traversal.factory.createNumericLiteral(column)
                        ),
                        traversal.factory.createPropertyAssignment(
                          "props",
                          serializeProps(
                            traversal,
                            node.openingElement.attributes
                          )
                        ),
                        traversal.factory.createPropertyAssignment(
                          "translate",
                          transform.translate
                            ? traversal.factory.createTrue()
                            : traversal.factory.createFalse()
                        ),
                        traversal.factory.createPropertyAssignment(
                          "rotate",
                          transform.rotate
                            ? traversal.factory.createTrue()
                            : traversal.factory.createFalse()
                        ),
                        traversal.factory.createPropertyAssignment(
                          "scale",
                          transform.scale
                            ? traversal.factory.createTrue()
                            : traversal.factory.createFalse()
                        ),
                      ])
                    ),
                  ])
                )
              ),
            ])
          ),
          [node],
          traversal.factory.createJsxClosingElement(
            traversal.factory.createIdentifier("group")
          )
        );
      }

      return node;
    });

    transformedSource.move(destination, { overwrite: true });

    transformedSource.addVariableStatement({
      isExported: true,
      declarationKind: VariableDeclarationKind.Const,
      declarations: [
        {
          name: "__r3fEditorMeta",
          initializer: JSON.stringify({ customLighting }),
        },
      ],
    });

    transformedSource.saveSync();

    return { transformedPath: destination, customLighting };
  }

  function getSourceFile(path: string) {
    const sourceFile = project.addSourceFileAtPath(path);
    const sourceFileMeta = sourceFiles.get(path);

    if (!sourceFileMeta) {
      const { transformedPath } = transformSouceFileSync(sourceFile);
      const abort = new AbortController();
      const iterable = watch(path, { signal: abort.signal });

      const watcher: FsWatcher = {
        abort: () => abort.abort(),
        iterable,
      };

      sourceFiles.set(path, { transformedPath, watcher });
      watchSourceFile(sourceFile, watcher);

      return {
        sourceFile,
        transformedPath,
      };
    }

    return {
      sourceFile,
      transformedPath: sourceFileMeta.transformedPath,
    };
  }

  router.get("/scene/open", async (context) => {
    const path = getParam(context, "path");
    const setCwd = getParam(context, "cwd");

    if (setCwd !== cwd) {
      try {
        // First open, clear out the transform folder.
        await remove(transformedFilesPath(), { recursive: true });
      } catch (e) {
        // Already removed, continue
      }
    }

    cwd = setCwd;

    const { sourceFile, transformedPath } = getSourceFile(path);

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

  function getAllJsxElements(sourceFile: SourceFile) {
    const jsxElements = sourceFile.getDescendantsOfKind(
      SyntaxKind.JsxOpeningElement
    );
    const jsxSelfClosing = sourceFile.getDescendantsOfKind(
      SyntaxKind.JsxSelfClosingElement
    );

    const elements: (JsxSelfClosingElement | JsxOpeningElement)[] = [];
    elements.push(...jsxSelfClosing, ...jsxElements);

    return elements;
  }

  router.get("/scene/object/:line/:column", (context) => {
    const path = getParam(context, "path");
    const { sourceFile } = getSourceFile(path);
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
    const types = getJsxElementMeta(sourceFile, name);

    context.response.body = { name, props, types };
  });

  router.get("/scene/object/:line/:column/prop", (context) => {
    const path = getParam(context, "path");
    const value = getParam(context, "value");
    const name = getParam(context, "name");
    const line = Number(context.params.line);
    const column = Number(context.params.column);
    const { sourceFile } = getSourceFile(path);
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
    const { sourceFile } = getSourceFile(path);
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
    const sourceFile = project.getSourceFile(path);
    if (sourceFile) {
      project.removeSourceFile(sourceFile);
    }

    const meta = sourceFiles.get(path);
    if (meta) {
      await remove(meta.transformedPath);
      meta.watcher.abort();
      sourceFiles.delete(path);
    }

    context.response.body = { message: "success" };
  });

  router.get("/scene/save", async (context) => {
    const path = getParam(context, "path");
    const sourceFile = project.getSourceFile(path);
    if (sourceFile) {
      await sourceFile.save();
    }

    context.response.body = { message: "success" };
  });

  app.use(router.routes());
  app.use(router.allowedMethods());

  return {
    listen: (port = 8000) => app.listen({ port }),
  };
}
