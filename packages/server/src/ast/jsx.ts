import {
  type JsxSelfClosingElement,
  type SourceFile,
  JsxElement,
  Node,
  SyntaxKind,
  ts,
  Expression,
  JsxAttribute,
} from "ts-morph";
import { Prop, PropType } from "../types";
import { getJsxElementPropTypes } from "./type-infer";

export function getJsxAttributeValue(expression: Expression | undefined): Prop {
  // Value is inside a JSX expression
  if (Node.isIdentifier(expression)) {
    const text = expression.getText();
    return {
      type: "identifier",
      value: text === "undefined" ? undefined : text,
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

/**
 * Returns all found jsx elements in a source file, optionally filtered by a
 * specific export.
 *
 * @param sourceFile
 * @param exportName When defined will only return the jsx elements for that
 *   export.
 */
export function getAllJsxElements(sourceFile: SourceFile, exportName?: string) {
  let nodeToSearch: Node = sourceFile;

  if (exportName) {
    const foundExport = sourceFile
      .getExportSymbols()
      .find((symbol) => symbol.getName() === exportName);

    if (!foundExport) {
      throw new Error(`invariant: export ${exportName} not found`);
    }

    nodeToSearch = getExportDeclaration(foundExport.getDeclarations()[0]);
  }

  const jsxElements = nodeToSearch.getDescendantsOfKind(SyntaxKind.JsxElement);
  const jsxSelfClosing = nodeToSearch.getDescendantsOfKind(
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
    const declarations = node
      .asKind(SyntaxKind.ExportAssignment)
      ?.getExpression()
      .getSymbol()
      ?.getDeclarations()
      .filter((decl) => {
        if (
          Node.isTypeAliasDeclaration(decl) ||
          Node.isInterfaceDeclaration(decl)
        ) {
          // Exclude types and interfaces
          return false;
        }

        if (Node.isImportSpecifier(decl)) {
          if (decl.isTypeOnly()) {
            // Exclude type import specifiers
            return false;
          }

          if (
            decl
              .getParent()
              .getParentIfKindOrThrow(SyntaxKind.ImportClause)
              .isTypeOnly()
          ) {
            // Exclude type clauses
            return false;
          }
        }

        return true;
      });

    // The result should be the first declaration.
    const result = declarations?.[0];

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

export function getAttributes(
  element: JsxSelfClosingElement | JsxElement
): Record<string, JsxAttribute> {
  const attributes = Node.isJsxSelfClosingElement(element)
    ? element.getAttributes()
    : element.getOpeningElement().getAttributes();

  const attrs: Record<string, JsxAttribute> = {};

  for (let i = 0; i < attributes.length; i++) {
    const attr = attributes[i];
    if (Node.isJsxAttribute(attr)) {
      attrs[attr.getName()] = attr;
    }
  }

  return attrs;
}

function mergePropTypeValue(prop: Prop, type: PropType) {
  if (prop.type === "identifier" && prop.value === undefined) {
    if (type.type.type === "union") {
      return {
        type: "union",
        values: type.type.values,
        value: prop.value,
      };
    }

    return {
      type: type.type.type,
      value: prop.value,
    };
  }

  if (
    prop.type === "string" &&
    type.type.type === "union" &&
    type.type.values.every((value) => value.type === "string")
  ) {
    return {
      type: "union",
      values: type.type.values,
      value: prop.value,
    };
  }

  if (type.type.type === "tuple" && prop.type === "array") {
    return {
      type: prop.type,
      value: type.type.values.map((value, index) => {
        const actualValue = prop.value[index];

        if (actualValue) {
          return {
            ...value,
            value: actualValue ? actualValue.value : undefined,
          };
        }

        return value;
      }),
    };
  }

  return { type: prop.type, value: prop.value };
}

function toProp(type: PropType["type"], name: string): Prop {
  switch (type.type) {
    case "tuple": {
      return {
        type: "array",
        value: type.values.map((val) => toProp(val, name)),
      };
    }

    case "boolean": {
      return {
        type: "boolean",
        value: false,
        ...(typeof type.label === "string" ? { label: type.label } : {}),
        ...(typeof type.required === "boolean"
          ? { required: type.required }
          : {}),
      };
    }

    case "number": {
      return {
        type: "number",
        ...(typeof type.label === "string" ? { label: type.label } : {}),
        ...(typeof type.required === "boolean"
          ? { required: type.required }
          : {}),
      };
    }

    case "string": {
      return {
        type: "string",
        value: type.value,
        ...(typeof type.label === "string" ? { label: type.label } : {}),
        ...(typeof type.required === "boolean"
          ? { required: type.required }
          : {}),
      };
    }

    case "union": {
      return {
        type: "union",
        values: type.values.map((val) => toProp(val, name)),
      };
    }
  }

  return {
    type: "unhandled",
    value: "",
  };
}

function hasUnhandled(prop: Prop) {
  return prop.type === "unhandled";
}

type ElementProp = DeclaredProp | UndeclaredProp;

interface DeclaredProp {
  declaration: "declared";
  column: number;
  description: string | undefined;
  line: number;
  name: string;
  required: boolean;
  type: string;
  value: unknown;
  values?: unknown;
}

interface UndeclaredProp {
  declaration: "undeclared";
  description: string | undefined;
  name: string;
  required: boolean;
  type: string;
  value?: unknown;
  values?: unknown;
}

const propsSortList: Record<string, number> = [
  "position",
  "scale",
  "rotation",
  "args",
  "name",
  "visible",
  "castShadow",
  "receiveShadow",
  "color",
  "opacity",
  "transparent",
  "metalness",
  "roughness",
].reduce((acc, val, index) => Object.assign(acc, { [val]: 1000 - index }), {});

const propsExcludeList: Record<string, true> = {
  attach: true,
  children: true,
  id: true,
  isAmbientLight: true,
  isBufferGeometry: true,
  isDirectionalLight: true,
  isHemisphereLight: true,
  isLight: true,
  isLineBasicMaterial: true,
  isLineDashedMaterial: true,
  isMaterial: true,
  isMesh: true,
  isMeshBasicMaterial: true,
  isMeshDepthMaterial: true,
  isMeshDistanceMaterial: true,
  isMeshLambertMaterial: true,
  isMeshMatcapMaterial: true,
  isMeshNormalMaterial: true,
  isMeshPhongMaterial: true,
  isMeshPhysicalMaterial: true,
  isMeshStandardMaterial: true,
  isMeshToonMaterial: true,
  isObject3D: true,
  isPointLight: true,
  isPointsMaterial: true,
  isRawShaderMaterial: true,
  isRectAreaLight: true,
  isShaderMaterial: true,
  isShadowMaterial: true,
  isSpotLight: true,
  isSpriteMaterial: true,
  key: true,
  matrix: true,
  matrixAutoUpdate: true,
  matrixWorldAutoUpdate: true,
  matrixWorldNeedsUpdate: true,
  needsUpdate: true,
  ref: true,
  steps: true,
  type: true,
  up: true,
  uuid: true,
  version: true,
};

export function getJsxElementProps(
  sourceFile: SourceFile,
  element: JsxSelfClosingElement | JsxElement
) {
  const props: ElementProp[] = [];
  const attributes = getAttributes(element);
  const { propTypes } = getJsxElementPropTypes(element);

  for (let i = 0; i < propTypes.length; i++) {
    const propType = propTypes[i];

    if (propsExcludeList[propType.name]) {
      continue;
    }

    if (propType.declared) {
      // This prop is statically declared on the jsx element
      // Let's do some massaging and mix the concrete usage
      // With the declared type and add it to the return array.
      const prop = attributes[propType.name];
      const { column, line } = sourceFile.getLineAndColumnAtPos(
        prop.getStart()
      );
      const initializer = prop.getInitializer();
      const propName = prop.getChildAtIndex(0).getText();
      const value = getJsxAttributeValue(
        Node.isJsxExpression(initializer)
          ? initializer.getExpressionOrThrow()
          : initializer
      );

      props.push({
        declaration: "declared",
        description: propType.description,
        required: propType.required,
        column: column,
        line: line,
        name: propName,
        ...mergePropTypeValue(value, propType),
      });
    } else {
      // This prop isn't currently declared - let's do some work and
      // massage the output to match declared props and add it to the array.
      const prop = toProp(propType.type, propType.name);
      if (
        prop.type === "unhandled" ||
        (prop.type === "array" &&
          (prop.value.length === 0 || prop.value.find(hasUnhandled)))
      ) {
        continue;
      }

      props.push({
        declaration: "undeclared",
        description: propType.description,
        required: propType.required,
        name: propType.name,
        ...prop,
      });
    }
  }

  return props.sort((propA, propB) => {
    const aPos = propsSortList[propA.name] ?? -1;
    const bPos = propsSortList[propB.name] ?? -1;

    if (aPos < bPos) {
      return 1;
    }

    if (bPos < aPos) {
      return -1;
    }

    return propA.name.localeCompare(propB.name);
  });
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
