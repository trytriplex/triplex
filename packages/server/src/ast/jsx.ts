import {
  type JsxAttributeLike,
  type JsxSelfClosingElement,
  type SourceFile,
  type TransformTraversalControl,
  type Type,
  createWrappedNode,
  Expression,
  JsxElement,
  Node,
  SyntaxKind,
  ts,
} from "ts-morph";

function isStaticType(expression: Expression<ts.Expression>): boolean {
  if (Node.isArrayLiteralExpression(expression)) {
    const result = expression.compilerNode.elements.map((element) => {
      return isStaticType(createWrappedNode(element));
    });

    if (result.every((value) => !!value)) {
      return true;
    }
  }

  if (Node.isPrefixUnaryExpression(expression)) {
    return isStaticType(expression.getOperand());
  }

  if (Node.isLiteralLike(expression)) {
    return true;
  }

  return false;
}

export function getJsxAttributeValue(prop: JsxAttributeLike) {
  const expression = prop
    .getChildrenOfKind(SyntaxKind.JsxExpression)[0]
    ?.getExpression();
  let result = "undefined";
  let type = "unhandled";

  if (expression) {
    type = isStaticType(expression) ? "static" : "unhandled";
    result = expression
      .getFullText()
      .replace(/\n| /g, "")
      .replace(/(,)(}|])/g, (match) => match.replace(",", ""));
  }

  const stringLiteral = prop.getChildrenOfKind(SyntaxKind.StringLiteral)[0];
  if (stringLiteral) {
    type = "static";
    result = stringLiteral.getText();
  }

  try {
    return {
      type,
      value: JSON.parse(result),
    };
  } catch (_e) {
    return { type, value: result };
  }
}

export function unrollType(type: Type, _nested = false): unknown {
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

export function getJsxElementPropTypes(
  sourceFile: SourceFile,
  element: JsxSelfClosingElement | JsxElement
) {
  const tag = getJsxTag(element);
  const propTypes: Record<
    string,
    { name: string; required: boolean; type: unknown }
  > = {};

  if (tag.type === "host") {
    return {
      filePath: "",
      propTypes,
    };
  }

  const symbol = sourceFile.getLocalOrThrow(tag.name);
  const node = symbol
    .getDeclarations()[0]
    .getType()
    .getSymbolOrThrow()
    .getDeclarations()[0];

  if (!Node.isArrowFunction(node) && !Node.isFunctionDeclaration(node)) {
    throw new Error("invariant: unhandled");
  }

  const [props] = node.getParameters();
  const functionFilePath = node.getSourceFile().getFilePath();

  if (props) {
    props
      .getType()
      .getProperties()
      .forEach((prop) => {
        propTypes[prop.getName()] = {
          name: prop.getName(),
          required: !prop.isOptional(),
          type: unrollType(prop.getTypeAtLocation(node)),
        };
      });
  }

  return {
    filePath: functionFilePath,
    propTypes,
  };
}

export function serializeProps(
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
        // Implicit true
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
            throw new Error(
              `invariant: Unsupported syntax [${prop.initializer.kind}]`
            );
        }
      }

      return traversal.factory.createPropertyAssignment(
        traversal.factory.createStringLiteralFromNode(prop.name),
        value
      );
    })
  );
}

export function getAllJsxElements(sourceFile: SourceFile) {
  const jsxElements = sourceFile.getDescendantsOfKind(SyntaxKind.JsxElement);
  const jsxSelfClosing = sourceFile.getDescendantsOfKind(
    SyntaxKind.JsxSelfClosingElement
  );

  const elements: (JsxSelfClosingElement | JsxElement)[] = [];
  elements.push(...jsxSelfClosing, ...jsxElements);

  return elements;
}

export type JsxElementPositions =
  | CustomJsxElementPosition
  | HostJsxElementPosition;

export interface CustomJsxElementPosition {
  column: number;
  line: number;
  name: string;
  children: JsxElementPositions[];
  type: "custom";
}

export interface HostJsxElementPosition {
  column: number;
  line: number;
  name: string;
  children: JsxElementPositions[];
  type: "host";
}

export function getJsxTag(node: JsxElement | JsxSelfClosingElement) {
  const name = Node.isJsxElement(node)
    ? node.getOpeningElement().getTagNameNode().getText()
    : node.getTagNameNode().getText();
  const type: "host" | "custom" = /^[a-z]/.exec(name) ? "host" : "custom";

  return {
    name,
    type,
  };
}

export function getExportDeclaration(node: Node<ts.Node>) {
  if (Node.isExportAssignment(node)) {
    const result = node
      .asKind(SyntaxKind.ExportAssignment)
      ?.getExpression()
      .getSymbol()
      ?.getDeclarations()[0];

    if (!result) {
      throw new Error("invariant: could not find export declaration");
    }

    return result;
  }

  return node;
}

export function getJsxElementsPositions(
  sourceFile: SourceFile,
  exportName: string
): JsxElementPositions[] {
  const elements: JsxElementPositions[] = [];
  const parentPointers = new Map<Node, JsxElementPositions>();
  const foundExport = sourceFile
    .getExportSymbols()
    .find((symbol) => symbol.getName() === exportName);

  if (!foundExport) {
    throw new Error(`invariant: export ${exportName} not found`);
  }

  const declaration = getExportDeclaration(foundExport.getDeclarations()[0]);

  declaration.forEachDescendant((node) => {
    if (Node.isJsxElement(node) || Node.isJsxSelfClosingElement(node)) {
      const { column, line } = sourceFile.getLineAndColumnAtPos(node.getPos());
      const tag = getJsxTag(node);
      const positions: JsxElementPositions =
        tag.type === "custom"
          ? {
              column: column - 1,
              line: line - 1,
              name: tag.name,
              children: [],
              type: "custom",
            }
          : {
              column: column - 1,
              line: line - 1,
              name: tag.name,
              children: [],
              type: "host",
            };

      const parentElement = node.getParentIfKind(SyntaxKind.JsxElement);
      if (parentElement) {
        const parentPositions = parentPointers.get(parentElement);
        if (!parentPositions) {
          throw new Error("invariant");
        }

        parentPositions.children.push(positions);
      } else {
        elements.push(positions);
      }

      parentPointers.set(node, positions);
    }
  });

  return elements;
}

export function getAttributes(element: JsxSelfClosingElement | JsxElement) {
  const attributes = Node.isJsxSelfClosingElement(element)
    ? element.getAttributes()
    : element.getOpeningElement().getAttributes();

  return attributes;
}

export function getJsxElementProps(
  sourceFile: SourceFile,
  element: JsxSelfClosingElement | JsxElement
) {
  const attributes = getAttributes(element);
  const props = attributes.map((prop) => {
    const { column, line } = sourceFile.getLineAndColumnAtPos(prop.getPos());
    const value = getJsxAttributeValue(prop);

    return {
      column: column - 1,
      line: line - 1,
      name: prop.getChildAtIndex(0).getText(),
      value: value.value,
      type: value.type,
    };
  });

  return props;
}

export function getJsxElementAt(
  sourceFile: SourceFile,
  line: number,
  column: number
) {
  try {
    const pos = sourceFile.compilerNode.getPositionOfLineAndCharacter(
      line,
      column
    );

    const sceneObject = getAllJsxElements(sourceFile).find(
      (node) => node.getPos() === pos
    );

    return sceneObject;
  } catch (e) {
    return undefined;
  }
}

export function getJsxAttributeAt(
  sourceFile: SourceFile,
  line: number,
  column: number
) {
  const pos = sourceFile.compilerNode.getPositionOfLineAndCharacter(
    line,
    column
  );
  const attribute = sourceFile
    .getDescendantAtPos(pos)
    ?.getParentIfKind(SyntaxKind.JsxAttribute);

  return attribute;
}

/**
 * Do not use in production code, this is slow!
 * Instead prefer direct access via `getJsxElementAt()`.
 *
 * @private
 */
export function findJsxElement(
  sourceFile: SourceFile,
  name: string,
  exportName = "default"
) {
  const found = getJsxElementsPositions(sourceFile, exportName).flatMap(
    (x) => x.children
  );

  for (let i = 0; i < found.length; i++) {
    const element = found[i];
    if (element.name === name) {
      return getJsxElementAt(sourceFile, element.line, element.column);
    }
  }

  return undefined;
}
