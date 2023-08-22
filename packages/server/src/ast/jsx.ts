/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import {
  type JsxSelfClosingElement,
  type SourceFile,
  JsxElement,
  Node,
  SyntaxKind,
  ts,
  JsxAttribute,
} from "ts-morph";
import { getJsxElementPropTypes } from "./type-infer";

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
  const attributes = getAttributes(node);
  const name = Node.isJsxElement(node)
    ? node.getOpeningElement().getTagNameNode().getText()
    : node.getTagNameNode().getText();
  const type: "host" | "custom" = /^[a-z]/.exec(name) ? "host" : "custom";

  if (type === "host" && attributes.name) {
    const nameInitializer = attributes.name.getInitializer();
    const initializerValue = Node.isJsxExpression(nameInitializer)
      ? nameInitializer.getExpression()
      : nameInitializer;

    if (Node.isStringLiteral(initializerValue)) {
      return {
        name: initializerValue.getLiteralText(),
        tagName: name,
        type,
      };
    }
  }

  return {
    tagName: name,
    type,
    name: undefined,
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
              name: tag.tagName,
              children: [],
              type: "custom",
            }
          : {
              column: column,
              line: line,
              name: tag.name ? `${tag.name} (${tag.tagName})` : tag.tagName,
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
  _: SourceFile,
  element: JsxSelfClosingElement | JsxElement
) {
  const { props, transforms } = getJsxElementPropTypes(element);

  const sortedProps = props
    .filter((prop) => !propsExcludeList[prop.name] && prop.kind !== "unhandled")
    .sort((propA, propB) => {
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

  return { props: sortedProps, transforms };
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
