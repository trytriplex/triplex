import {
  type JsxSelfClosingElement,
  type SourceFile,
  type Type,
  JsxElement,
  Node,
  SyntaxKind,
  ts,
  Expression,
} from "ts-morph";

export function getJsxAttributeValue(expression: Expression | undefined): {
  type:
    | "identifier"
    | "array"
    | "string"
    | "function"
    | "boolean"
    | "number"
    | "unhandled";
  value: string | number | boolean | (string | number)[];
} {
  // Value is inside a JSX expression
  if (Node.isIdentifier(expression)) {
    return {
      type: "identifier",
      value: expression.getText(),
    };
  }

  if (Node.isArrayLiteralExpression(expression)) {
    // Hack around types too lazy to figure this out atm.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const value = expression.getElements().map(getJsxAttributeValue) as any;

    return {
      type: "array",
      value,
    };
  }

  if (Node.isStringLiteral(expression)) {
    return {
      type: "string",
      value: expression.getLiteralText(),
    };
  }

  if (Node.isNumericLiteral(expression)) {
    return {
      type: "number",
      value: Number(expression.getLiteralText()),
    };
  }

  if (Node.isPrefixUnaryExpression(expression)) {
    const operand = expression.getOperand();
    if (Node.isNumericLiteral(operand)) {
      return {
        type: "number",
        value: -Number(operand.getLiteralText()),
      };
    }
  }

  if (Node.isTrueLiteral(expression)) {
    return {
      type: "boolean",
      value: true,
    };
  }

  if (Node.isFalseLiteral(expression)) {
    return {
      type: "boolean",
      value: false,
    };
  }

  if (Node.isArrowFunction(expression)) {
    return {
      type: "function",
      value: "Function",
    };
  }

  if (!expression) {
    // Implicit boolean!
    return {
      type: "boolean",
      value: true,
    };
  }

  return {
    type: "unhandled",
    value: expression.getText(),
  };
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
      const { column, line } = sourceFile.getLineAndColumnAtPos(
        node.getStart()
      );
      const tag = getJsxTag(node);
      const positions: JsxElementPositions =
        tag.type === "custom"
          ? {
              column: column,
              line: line,
              name: tag.name,
              children: [],
              type: "custom",
            }
          : {
              column: column,
              line: line,
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
    const { column, line } = sourceFile.getLineAndColumnAtPos(prop.getStart());

    if (Node.isJsxSpreadAttribute(prop)) {
      return {
        column: column,
        line: line,
        name: "",
        value: `...${prop
          .getExpressionIfKindOrThrow(SyntaxKind.Identifier)
          .getText()}`,
        type: "spread",
      };
    }

    const initializer = prop.getInitializer();
    const value = getJsxAttributeValue(
      Node.isJsxExpression(initializer)
        ? initializer.getExpressionOrThrow()
        : initializer
    );

    return {
      column: column,
      line: line,
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
    const sceneObject = getAllJsxElements(sourceFile).find((node) => {
      const pos = sourceFile.getLineAndColumnAtPos(node.getStart());
      return pos.line === line && pos.column === column;
    });

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
