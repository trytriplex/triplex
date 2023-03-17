import {
  JsxElement,
  JsxSelfClosingElement,
  Node,
  PropertySignature,
  Type,
} from "ts-morph";

function unrollType(type: Type): { type: string; value?: unknown } {
  if (type.isUndefined()) {
    return {
      type: "undefined",
    };
  }

  if (type.isNumber()) {
    return {
      type: "number",
    };
  }

  if (type.isString()) {
    return {
      type: "string",
    };
  }

  if (type.isBoolean()) {
    return {
      type: "boolean",
    };
  }

  if (type.isAny()) {
    return {
      type: "any",
    };
  }

  if (type.isTuple()) {
    const elements = type.getTupleElements();

    return {
      type: "tuple",
      value: elements.map(unrollType),
    };
  }

  if (type.isUnion()) {
    const types = type.getUnionTypes();

    return {
      type: "union",
      value: types.map(unrollType),
    };
  }

  return {
    type: "unknown",
  };
}

export function getJsxElementPropTypes(
  element: JsxSelfClosingElement | JsxElement
) {
  const tagNode = Node.isJsxSelfClosingElement(element)
    ? element.getTagNameNode()
    : element.getOpeningElement().getTagNameNode();
  const jsxType = tagNode.getType();
  const signatures = jsxType.getCallSignatures();
  const propTypes: Record<
    string,
    {
      name: string;
      required: boolean;
      description: string | null;
      type: { type: string; value?: unknown };
    }
  > = {};

  if (signatures.length === 0) {
    // No types found!
    return propTypes;
  }

  const [props] = signatures[0].getParameters();

  if (!props) {
    // No props arg
    return propTypes;
  }

  const valueDeclaration = props.getValueDeclaration();

  if (!valueDeclaration) {
    // No decl found!
    return propTypes;
  }

  const declaration = jsxType.getSymbolOrThrow().getDeclarations()[0];

  const propsType = element
    .getProject()
    .getTypeChecker()
    .getTypeOfSymbolAtLocation(props, valueDeclaration);

  const properties = propsType.getApparentProperties();

  for (let i = 0; i < properties.length; i++) {
    const prop = properties[i];
    const declarations = prop.getDeclarations();
    const propDeclaration = declarations[0] as PropertySignature;
    const propName = prop.getName();
    const propType = prop.getTypeAtLocation(declaration);
    const description = prop
      .getDeclarations()
      .filter(Node.isJSDocable)
      .map((declaration) =>
        declaration
          .getJsDocs()
          .map((doc) => doc.getComment())
          .flat()
      )
      .join("\n");

    propTypes[propName] = {
      name: propName,
      required: !propDeclaration?.hasQuestionToken(),
      description: description || null,
      type: unrollType(propType),
    };
  }

  return propTypes;
}
