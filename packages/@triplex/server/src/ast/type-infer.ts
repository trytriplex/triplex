/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import {
  Node,
  type Expression,
  type JsxAttribute,
  type JsxChild,
  type JsxElement,
  type JsxSelfClosingElement,
  type JsxText,
  type PropertySignature,
  type Symbol as SymbolType,
  type ts,
  type Type,
} from "ts-morph";
import type {
  AttributeValue,
  DeclaredProp,
  ExpressionValue,
  Prop,
  UnionType,
  Type as UnrolledType,
} from "../types";
import { getAttributes } from "./jsx";
import { getExportName } from "./module";
import { type SourceFileReadOnly } from "./project";

export function resolveAttributeValue(attribute: JsxAttribute): {
  start: number;
  value: ExpressionValue;
} {
  const initializer = attribute.getInitializer();
  const value = resolveExpressionValue(
    Node.isJsxExpression(initializer)
      ? initializer.getExpressionOrThrow()
      : initializer,
  );

  return { start: attribute.getStart(), value };
}

export function resolveChildJsxValue(children: JsxChild[]): {
  start: number;
  value: ExpressionValue;
} {
  if (children.length === 1) {
    return {
      start: children[0].getStart(),
      value: resolveExpressionValue(children[0]),
    };
  }

  return {
    start: children[0].getStart(),
    value: {
      kind: "unhandled",
      value: children.map((child) => child.getText()).join(""),
    },
  };
}

export function sortUnionType(type: UnionType, value: AttributeValue) {
  const isLiteralUnion = type.shape.every((val) => "literal" in val);
  if (isLiteralUnion) {
    // Bail out from sorting literal unions. We don't want their item positions to change in the UI.
    return;
  }

  const typeOfValue = typeof value;
  const isValueAnArray = Array.isArray(value);

  type.shape.sort((typeA, typeB) => {
    if (typeOfValue === typeA.kind) {
      return -1;
    }

    if (typeOfValue === typeB.kind) {
      return 1;
    }

    if (isValueAnArray) {
      if (typeA.kind === "tuple") {
        let partialMatch = true;

        for (let i = 0; i < value.length; i++) {
          const typeofElValue = typeof value[i];
          const elType = typeA.shape[i];

          if (elType.kind !== typeofElValue) {
            partialMatch = false;
            break;
          }
        }

        if (partialMatch) {
          return -1;
        }
      }

      if (typeB.kind === "tuple") {
        let partialMatch = true;

        for (let i = 0; i < value.length; i++) {
          const typeofElValue = typeof value[i];
          const elType = typeB.shape[i];

          if (elType.kind !== typeofElValue) {
            partialMatch = false;
            break;
          }
        }

        if (partialMatch) {
          return 1;
        }
      }
    }

    return 0;
  });
}

export function unrollType(
  type: Type,
  unionLabels: Record<string, string> = {},
): UnrolledType {
  if (type.isNumber()) {
    return {
      kind: "number",
    };
  }

  if (type.isString()) {
    return {
      kind: "string",
    };
  }

  if (type.isBoolean()) {
    return {
      kind: "boolean",
    };
  }

  if (type.isBooleanLiteral()) {
    return {
      kind: "boolean",
      literal: !!type.getLiteralValue(),
    };
  }

  if (type.isTuple()) {
    const elements = type.getTupleElements();
    const labels = ((type.compilerType as ts.TupleType).target as ts.TupleType)
      .labeledElementDeclarations;

    return {
      kind: "tuple",
      shape: elements.map((val, index) => ({
        ...unrollType(val, unionLabels),
        label: labels ? labels[index]?.name.getText() : undefined,
        required: labels ? !labels[index]?.questionToken : true,
      })),
    };
  }

  if (type.isUnion()) {
    const types = type.getUnionTypes();
    const shape = types
      .map((val) => {
        const unrolled = unrollType(val, unionLabels);
        const label = unionLabels[val.getText()];

        if (label) {
          return {
            ...unrolled,
            label,
          };
        }

        return unrolled;
      })
      // Filter out unknown values - if its unknown we don't want to handle it.
      .filter((val) => val.kind !== "unhandled")
      .filter(
        // Remove duplicates if any exist
        (v, i, a) =>
          a.findIndex((v2) => JSON.stringify(v2) === JSON.stringify(v)) === i,
      );

    if (shape.length === 1) {
      // After filter if there is only one value let's throw away the union and return the
      // only value inside it. Easier for us to handle on the client that way.
      return shape[0];
    }

    return {
      kind: "union",
      shape,
    };
  }

  if (type.isStringLiteral()) {
    return {
      kind: "string",
      literal: `${type.getLiteralValueOrThrow()}`,
    };
  }

  if (type.isNumberLiteral()) {
    return {
      kind: "number",
      literal: Number(`${type.getLiteralValueOrThrow()}`),
    };
  }

  return {
    kind: "unhandled",
  };
}

function getJsxDeclProps(element: JsxSelfClosingElement | JsxElement) {
  const tagName = Node.isJsxSelfClosingElement(element)
    ? element.getTagNameNode()
    : element.getOpeningElement().getTagNameNode();

  if (/^[a-z]/.exec(tagName.getText())) {
    const jsxType = tagName.getSymbolOrThrow().getDeclarations()[0].getType();
    return {
      declaration: element,
      properties: jsxType.getApparentProperties(),
    };
  } else {
    const jsxType = tagName.getType();
    const signatures = jsxType.getCallSignatures();
    if (signatures.length === 0) {
      // No signatures for this call-like node found.
      return null;
    }

    const [props] = signatures[0].getParameters();
    if (!props) {
      // No props arg
      return null;
    }

    const valueDeclaration = props.getValueDeclaration();
    if (!valueDeclaration) {
      // No decl found!
      return null;
    }

    const symbol = jsxType.getSymbol() || jsxType.getAliasSymbol();
    if (!symbol) {
      throw new Error("invariant: could not find symbol");
    }

    const declaration = symbol.getDeclarations()[0];
    const propsType = element
      .getProject()
      .getTypeChecker()
      .getTypeOfSymbolAtLocation(props, valueDeclaration);

    const properties = propsType.getApparentProperties();

    return {
      declaration,
      properties,
      symbolType: props,
    };
  }
}

function toPrimitive(value?: string): string | boolean | number {
  if (value === undefined || value === "true") {
    return true;
  }

  const valueAsNumber = Number(value);

  if (Number.isNaN(valueAsNumber)) {
    return value;
  }

  return valueAsNumber;
}

function extractJSDoc(symbol: SymbolType) {
  const decls = symbol.getDeclarations().filter(Node.isJSDocable);

  const tags: Record<string, string | boolean | number> = {};
  const description: string[] = [];

  for (let i = 0; i < decls.length; i++) {
    const decl = decls[i];
    const jsdocs = decl.getJsDocs();

    jsdocs.forEach((doc) => {
      description.push(doc.getDescription().trim());
      doc.getTags().map((tag) => {
        const name = tag.getTagName();
        const value = tag.getCommentText();

        tags[name] = toPrimitive(value);
      });
    });
  }

  return {
    description: description.length ? description.join("\n") : undefined,
    tags,
  };
}

function collectUnionLabels(
  propType: Type,
  outLabels: Record<string, Record<string, string>>,
  propDecl: PropertySignature,
): Record<string, string> | undefined {
  let propTypeName = propType.getText();

  if (propType.isUnion()) {
    // Collect union labels for use later.
    if (outLabels[propTypeName]) {
      // We've already collected the labels for this union type. Skip!
    } else {
      let symbol = propType.getSymbol() || propType.getAliasSymbol();

      if (!symbol) {
        // Hack to try and resolve the union labels by an alternate means.
        const typeNode = propDecl.getTypeNode?.();
        if (Node.isUnionTypeNode(typeNode)) {
          typeNode.getTypeNodes().find((val) => {
            const s = val.getType().getAliasSymbol();
            if (s) {
              symbol = s;
            }
          });
        }
      }

      outLabels[propTypeName] = {};

      symbol
        ?.getDeclarations()[0]
        .forEachDescendantAsArray()
        .forEach((node) => {
          if (Node.isTypeQuery(node) && node.getType().isLiteral()) {
            const label = node.getExprName().getText();
            const typeValue = node.getType().getText();

            if (!outLabels[propTypeName][typeValue]) {
              outLabels[propTypeName][typeValue] = label;
            }
          }

          if (Node.isEnumMember(node)) {
            const label = node.getName();
            const typeValue = `${propTypeName}.${label}`;

            if (typeValue) {
              if (!outLabels[propTypeName][typeValue]) {
                outLabels[propTypeName][typeValue] = label;
              }
            }
          }
        });
    }
  }

  return outLabels[propTypeName];
}

export function resolveExpressionValue(
  expression: Expression | JsxText | undefined,
): ExpressionValue {
  // Value is inside a JSX expression
  if (Node.isIdentifier(expression)) {
    const text = expression.getText();
    if (text === "undefined") {
      return { kind: "undefined", value: undefined };
    }

    return { kind: "identifier", value: text };
  }

  if (Node.isArrayLiteralExpression(expression)) {
    const elements = expression.getElements();
    const value: AttributeValue[] = [];

    for (let i = 0; i < elements.length; i++) {
      const nextElement = elements[i];
      const nextValue = resolveExpressionValue(nextElement);
      if (nextValue.kind === "unhandled") {
        return { kind: "unhandled", value: expression.getText() };
      }

      value.push(nextValue.value);
    }

    return { kind: "array", value };
  }

  if (Node.isStringLiteral(expression)) {
    return { kind: "string", value: expression.getLiteralText() };
  }

  if (Node.isJsxText(expression)) {
    return { kind: "string", value: expression.getText() };
  }

  if (Node.isNumericLiteral(expression)) {
    return { kind: "number", value: Number(expression.getLiteralText()) };
  }

  if (Node.isPrefixUnaryExpression(expression)) {
    const operand = expression.getOperand();
    if (Node.isNumericLiteral(operand)) {
      return { kind: "number", value: -Number(operand.getLiteralText()) };
    }
  }

  if (Node.isTrueLiteral(expression)) {
    return { kind: "boolean", value: true };
  }

  if (Node.isFalseLiteral(expression)) {
    return { kind: "boolean", value: false };
  }

  if (!expression) {
    // Implicit boolean!
    return { kind: "boolean", value: true };
  }

  return { kind: "unhandled", value: expression.getText() };
}

export function getJsxElementPropTypes(
  element: JsxSelfClosingElement | JsxElement,
) {
  const props: (Prop | DeclaredProp)[] = [];
  const { attributes, children } = getAttributes(element);
  const jsxDecl = getJsxDeclProps(element);
  const unionValueLabels: Record<string, Record<string, string>> = {};
  const defaultValues: Record<string, ExpressionValue> = {};

  if (!jsxDecl) {
    return {
      props: [],
      transforms: { rotate: false, scale: false, translate: false },
    };
  }

  const { declaration, properties, symbolType } = jsxDecl;

  let rotate = false;
  let scale = false;
  let translate = false;

  const binding = getComponentPropsObjectBinding(declaration, symbolType);
  if (binding) {
    binding.getElements().forEach((element) => {
      const name = element.getPropertyNameNode() || element.getNameNode();
      if (!name) {
        return;
      }

      const propertyName = name.getText();
      const initializer = element.getInitializer();

      if (!initializer) {
        return;
      }

      defaultValues[propertyName] = resolveExpressionValue(initializer);
    });
  }

  for (let i = 0; i < properties.length; i++) {
    const prop = properties[i];
    const declarations = prop.getDeclarations();
    const propName = prop.getName();
    const propDeclaration = declarations[0] as PropertySignature;
    const propType = prop.getTypeAtLocation(declaration);
    const { description, tags } = extractJSDoc(prop);
    const unionLabels = collectUnionLabels(
      propType,
      unionValueLabels,
      propDeclaration,
    );
    const defaultValue = defaultValues[propName];
    const isOptional =
      !!propDeclaration?.hasQuestionToken?.() ||
      tags.default !== undefined ||
      tags.defaultValue !== undefined;
    const declaredProp =
      propName === "children"
        ? children || attributes[propName]
        : attributes[propName];

    if (declaredProp) {
      const type = unrollType(propType, unionLabels);
      const { start, value } = Array.isArray(declaredProp)
        ? resolveChildJsxValue(declaredProp)
        : resolveAttributeValue(declaredProp);
      const { column, line } = element
        .getSourceFile()
        .getLineAndColumnAtPos(start);

      if (value.kind !== "unhandled" && value.kind !== "identifier") {
        if (propName === "rotation") {
          rotate = true;
        } else if (propName === "position") {
          translate = true;
        } else if (propName === "scale") {
          scale = true;
        }
      }

      if (type.kind === "union") {
        // Sort the union values to have the one that matches the first value as the first option.
        sortUnionType(type, value.value);
      }

      props.push({
        ...type,
        column,
        description: description || undefined,
        line,
        name: propName,
        required: !isOptional,
        tags,
        value: value.value as string,
        valueKind: value.kind,
        ...(defaultValue ? { defaultValue } : undefined),
      });
    } else {
      const type = unrollType(propType, unionLabels);

      if (propName === "rotation") {
        rotate = true;
      } else if (propName === "position") {
        translate = true;
      } else if (propName === "scale") {
        scale = true;
      }

      if (type.kind === "union" && defaultValue) {
        // Sort the union values to have the one that matches the first value as the first option.
        sortUnionType(type, defaultValue.value);
      }

      props.push({
        ...type,
        description: description || undefined,
        name: propName,
        required: !isOptional,
        tags,
        ...(defaultValue ? { defaultValue } : undefined),
      });
    }
  }

  return { props, transforms: { rotate, scale, translate } };
}

function getComponentPropsObjectBinding(
  declaration: Node,
  propsSymbolType?: SymbolType,
) {
  const valueDeclaration = propsSymbolType?.getValueDeclaration();
  if (Node.isParameterDeclaration(valueDeclaration)) {
    const nameNode = valueDeclaration.getNameNode();

    if (Node.isObjectBindingPattern(nameNode)) {
      return nameNode;
    }
  }

  if (Node.isVariableDeclaration(declaration)) {
    const initializer = declaration.getInitializer();
    if (Node.isArrowFunction(initializer)) {
      const param = initializer.getParameters()[0];
      if (param) {
        const binding = param.getNameNode();
        if (Node.isObjectBindingPattern(binding)) {
          return binding;
        }
      }
    }
  }

  return undefined;
}

export function getFunctionPropTypes(
  sourceFile: SourceFileReadOnly,
  exportName: string,
) {
  const propTypes: Prop[] = [];
  const empty = {
    props: propTypes,
    transforms: { rotate: false, scale: false, translate: false },
  };
  const { declaration } = getExportName(sourceFile, exportName);
  const type = declaration.getType();
  const signatures = type.getCallSignatures();

  if (signatures.length === 0) {
    // No signatures for this call-like node found.
    return empty;
  }

  const [props] = signatures[0].getParameters();
  if (!props) {
    // No props arg
    return empty;
  }

  const propsType = sourceFile
    .getProject()
    .getTypeChecker()
    .getTypeOfSymbolAtLocation(props, declaration);

  const properties = propsType.getApparentProperties();
  const defaultValues: Record<string, ExpressionValue> = {};

  let rotate = false;
  let scale = false;
  let translate = false;

  const binding = getComponentPropsObjectBinding(declaration, props);
  if (binding) {
    binding.getElements().forEach((element) => {
      const name = element.getPropertyNameNode() || element.getNameNode();
      if (!name) {
        return;
      }

      const propertyName = name.getText();
      const initializer = element.getInitializer();

      if (!initializer) {
        return;
      }

      defaultValues[propertyName] = resolveExpressionValue(initializer);
    });
  }

  for (let i = 0; i < properties.length; i++) {
    const prop = properties[i];
    const declarations = prop.getDeclarations();
    const propDeclaration = declarations[0] as PropertySignature;
    const propName = prop.getName();
    const propType = prop.getTypeAtLocation(declaration);
    const { description, tags } = extractJSDoc(prop);

    if (propName === "rotation") {
      rotate = true;
    } else if (propName === "position") {
      translate = true;
    } else if (propName === "scale") {
      scale = true;
    }

    const defaultValue = defaultValues[propName];

    propTypes.push({
      ...unrollType(propType),
      description: description || undefined,
      name: propName,
      required: !propDeclaration?.hasQuestionToken?.(),
      tags,
      ...(defaultValue ? { defaultValue } : undefined),
    });
  }

  return { props: propTypes, transforms: { rotate, scale, translate } };
}
