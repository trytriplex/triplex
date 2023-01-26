import {
  SyntaxKind,
  ts,
  type JsxAttributeLike,
  type SourceFile,
  type TransformTraversalControl,
  type Type,
} from "ts-morph";

export function getJsxAttributeValue(prop: JsxAttributeLike) {
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

export function unrollType(type: Type, _nested = false): any {
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
  elementName: string
) {
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
            throw new Error(
              `invariant: Unsupported syntax [${prop.initializer.kind}]`
            );
        }
      }

      return traversal.factory.createPropertyAssignment(prop.name, value);
    })
  );
}
