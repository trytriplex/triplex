import { join } from "path";
import {
  createWrappedNode,
  JsxElement,
  JsxSelfClosingElement,
  SourceFile,
  SyntaxKind,
  TransformTraversalControl,
  ts,
} from "ts-morph";
import { getJsxElementPropTypes, getJsxTag, serializeProps } from "./jsx";
import { getLocalName } from "./module";

function getNodeTransforms(
  sourceFile: SourceFile,
  element: JsxSelfClosingElement | JsxElement
) {
  const tag = getJsxTag(element);
  if (tag.type === "host") {
    return {
      translate: true,
      scale: true,
      rotate: true,
    };
  }

  const meta = getJsxElementPropTypes(sourceFile, element);

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

function wrapSceneObject(
  traversal: TransformTraversalControl,
  originalSourceFile: SourceFile,
  transformedSourceFile: SourceFile,
  node: ts.JsxElement | ts.JsxSelfClosingElement
) {
  let foundLightJsxElement = false;

  const wrappedNode = createWrappedNode(node, {
    sourceFile: originalSourceFile.compilerNode.getSourceFile(),
  });

  const tag = getJsxTag(wrappedNode);
  const lineColumn = transformedSourceFile.getLineAndColumnAtPos(node.pos);
  const line = lineColumn.line - 1;
  const column = lineColumn.column - 1;
  const transform = getNodeTransforms(originalSourceFile, wrappedNode);
  const localName =
    tag.type === "custom" ? getLocalName(originalSourceFile, tag.name) : "";
  const attributes = ts.isJsxElement(node)
    ? node.openingElement.attributes
    : node.attributes;

  if (tag.name.endsWith("Light")) {
    // Found a jsx element that ends with light
    // Turn 'em off!
    foundLightJsxElement = true;
  }

  const newNode = traversal.factory.createJsxElement(
    traversal.factory.createJsxOpeningElement(
      traversal.factory.createIdentifier("group"),
      [],
      traversal.factory.createJsxAttributes(
        [
          attributes.properties.find((x) => x.name?.getText() === "key"),
          traversal.factory.createJsxAttribute(
            traversal.factory.createIdentifier("userData"),
            traversal.factory.createJsxExpression(
              undefined,
              traversal.factory.createObjectLiteralExpression([
                traversal.factory.createPropertyAssignment(
                  "triplexSceneMeta",
                  traversal.factory.createObjectLiteralExpression(
                    [
                      traversal.factory.createPropertyAssignment(
                        "name",
                        traversal.factory.createStringLiteral(tag.name)
                      ),
                      transform.filePath &&
                        traversal.factory.createPropertyAssignment(
                          "path",
                          traversal.factory.createStringLiteral(
                            transform.filePath || ""
                          )
                        ),
                      localName &&
                        traversal.factory.createPropertyAssignment(
                          "exportName",
                          traversal.factory.createStringLiteral(
                            localName.importName
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
                        serializeProps(traversal, attributes)
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
                    ].filter(Boolean) as ts.PropertyAssignment[]
                  )
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

  return {
    node: newNode,
    foundLightJsxElement,
  };
}

export function cloneAndWrapSourceJsx(sourceFile: SourceFile, tempDir: string) {
  // This will be the final destination persisted to the file system picked up by the Editor.
  const destination = join(tempDir, sourceFile.getFilePath());
  // This is a temporary destination so we can copy the source file and keep
  // node positions the same while transforming them.
  const tempDestination = join(tempDir, "/temp.tsx");
  const transformedSource = sourceFile.copy(tempDestination, {
    overwrite: true,
  });

  const foundFunctions: {
    name: string;
    meta: Record<string, boolean | string>;
  }[] = [];

  let foundLightJsxElement = false;
  let foundJsx = false;

  transformedSource.transform((traversal) => {
    const node = traversal.visitChildren();

    if (ts.isFunctionDeclaration(node) && foundJsx) {
      const wrappedNode = createWrappedNode(node, {
        sourceFile: sourceFile.compilerNode.getSourceFile(),
      });

      if (!wrappedNode.getParent()) {
        foundFunctions.push({
          name: wrappedNode.getNameOrThrow("Expected function to have a name"),
          meta: { lighting: foundLightJsxElement ? "custom" : "default" },
        });

        foundLightJsxElement = false;
        foundJsx = false;
      }
    }

    if (ts.isVariableStatement(node) && !node.parent && foundJsx) {
      // Top level variable statement
      const wrappedNode = createWrappedNode(node, {
        sourceFile: sourceFile.compilerNode.getSourceFile(),
      });
      const foundArrowFunctions = wrappedNode.getDescendantsOfKind(
        SyntaxKind.ArrowFunction
      );

      if (foundArrowFunctions[0]) {
        foundFunctions.push({
          name: node.declarationList.declarations[0].name.getText(),
          meta: { lighting: foundLightJsxElement ? "custom" : "default" },
        });

        foundJsx = false;
      }
    }

    if (!isSceneObject(node)) {
      return node;
    }

    const result = wrapSceneObject(
      traversal,
      sourceFile,
      transformedSource,
      node
    );

    if (result.foundLightJsxElement) {
      foundLightJsxElement = true;
    }

    foundJsx = true;

    return result.node;
  });

  foundFunctions.forEach((func) => {
    transformedSource.addStatements(
      `${func.name}.triplexMeta = ${JSON.stringify(func.meta)}`
    );
  });

  transformedSource.move(destination, { overwrite: true });
  transformedSource.saveSync();

  return {
    transformedPath: destination,
    transformedSourceFile: transformedSource,
  };
}
