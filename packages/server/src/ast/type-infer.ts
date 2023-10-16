/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import {
  Expression,
  JsxElement,
  JsxSelfClosingElement,
  Node,
  PropertySignature,
  SourceFile,
  Symbol as SymbolType,
  ts,
  Type,
} from "ts-morph";
import type {
  DeclaredProp,
  Prop,
  Type as UnrolledType,
  ValueKind,
} from "../types";
import { getAttributes } from "./jsx";
import { getExportName } from "./module";

export function unrollType(
  type: Type,
  unionLabels: Record<string, string> = {}
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
        label: labels ? labels[index].name.getText() : undefined,
        required: labels ? !labels[index].questionToken : true,
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
          a.findIndex((v2) => JSON.stringify(v2) === JSON.stringify(v)) === i
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
  propDecl: PropertySignature
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
        const typeNode = propDecl.getTypeNode();
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

type AttributeValue = number | string | boolean | undefined | AttributeValue[];
type ExpressionValue = {
  kind: ValueKind;
  value: AttributeValue;
};

export function resolveExpressionValue(
  expression: Expression | undefined
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
  element: JsxSelfClosingElement | JsxElement
) {
  const props: (Prop | DeclaredProp)[] = [];
  const attributes = getAttributes(element);
  const jsxDecl = getJsxDeclProps(element);
  const unionValueLabels: Record<string, Record<string, string>> = {};

  if (!jsxDecl) {
    return {
      props: [],
      transforms: { rotate: false, scale: false, translate: false },
    };
  }

  const { declaration, properties } = jsxDecl;

  let rotate = false;
  let scale = false;
  let translate = false;

  for (let i = 0; i < properties.length; i++) {
    const prop = properties[i];
    const declarations = prop.getDeclarations();
    const propName = prop.getName();
    const declaredProp = attributes[propName];
    const propDeclaration = declarations[0] as PropertySignature;
    const propType = prop.getTypeAtLocation(declaration);
    const { description, tags } = extractJSDoc(prop);
    const unionLabels = collectUnionLabels(
      propType,
      unionValueLabels,
      propDeclaration
    );

    if (declaredProp) {
      const initializer = declaredProp.getInitializer();
      const value = resolveExpressionValue(
        Node.isJsxExpression(initializer)
          ? initializer.getExpressionOrThrow()
          : initializer
      );
      const { column, line } = element
        .getSourceFile()
        .getLineAndColumnAtPos(declaredProp.getStart());
      const type = unrollType(propType, unionLabels);

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
        const actualValue = value.value;
        const typeOfValue = typeof actualValue;
        const isValueAnArray = Array.isArray(actualValue);

        // Sort the union values to have the one that matches the first
        // value as the first option.
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

              for (let i = 0; i < actualValue.length; i++) {
                const typeofElValue = typeof actualValue[i];
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

              for (let i = 0; i < actualValue.length; i++) {
                const typeofElValue = typeof actualValue[i];
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

      props.push({
        ...type,
        column,
        description: description || undefined,
        line,
        name: propName,
        required: !propDeclaration?.hasQuestionToken?.(),
        tags,
        value: value.value as string,
        valueKind: value.kind,
      });
    } else {
      if (propName === "rotation") {
        rotate = true;
      } else if (propName === "position") {
        translate = true;
      } else if (propName === "scale") {
        scale = true;
      }

      props.push({
        ...unrollType(propType, unionLabels),
        description: description || undefined,
        name: propName,
        required: !propDeclaration?.hasQuestionToken?.(),
        tags,
      });
    }
  }

  return { props, transforms: { rotate, scale, translate } };
}

export function getFunctionPropTypes(
  sourceFile: SourceFile,
  exportName: string
) {
  const propTypes: (Prop & { defaultValue?: ExpressionValue })[] = [];
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

  const valueDeclaration = props.getValueDeclaration();
  if (!valueDeclaration) {
    // No decl found!
    return empty;
  }

  const propsType = sourceFile
    .getProject()
    .getTypeChecker()
    .getTypeOfSymbolAtLocation(props, valueDeclaration);

  const properties = propsType.getApparentProperties();

  let rotate = false;
  let scale = false;
  let translate = false;
  const defaultValues: Record<string, ExpressionValue> = {};

  if (Node.isParameterDeclaration(valueDeclaration)) {
    const nameNode = valueDeclaration.getNameNode();
    const objectBinding = Node.isObjectBindingPattern(nameNode) && nameNode;
    if (objectBinding) {
      objectBinding.getElements().forEach((element) => {
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
