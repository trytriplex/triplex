import { join } from "path";
import {
  createWrappedNode,
  SourceFile,
  SyntaxKind,
  TransformTraversalControl,
  ts,
} from "ts-morph";
import { getJsxTag, serializeProps } from "./jsx";

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
  const wrappedNode = createWrappedNode(node, {
    sourceFile: originalSourceFile.compilerNode.getSourceFile(),
  });
  const tag = getJsxTag(wrappedNode);
  const lineColumn = transformedSourceFile.getLineAndColumnAtPos(node.pos);
  const line = lineColumn.line - 1;
  const column = lineColumn.column - 1;
  const attributes = ts.isJsxElement(node)
    ? node.openingElement.attributes
    : node.attributes;

  let foundLightJsxElement = false;

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
                  traversal.factory.createObjectLiteralExpression([
                    traversal.factory.createPropertyAssignment(
                      "name",
                      traversal.factory.createStringLiteral(tag.name)
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
                  ])
                ),
              ])
            )
          ),
        ].filter(Boolean) as ts.JsxAttributeLike[]
      )
    ),
    [
      ts.isJsxElement(node)
        ? traversal.factory.createJsxElement(
            traversal.factory.createJsxOpeningElement(
              node.openingElement.tagName,
              node.openingElement.typeArguments,
              node.openingElement.attributes
            ),
            node.children,
            node.closingElement
          )
        : traversal.factory.createJsxSelfClosingElement(
            node.tagName,
            node.typeArguments,
            node.attributes
          ),
    ],
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
