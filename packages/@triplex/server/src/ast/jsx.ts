/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import {
  Node,
  SyntaxKind,
  type JsxAttribute,
  type JsxChild,
  type JsxElement,
  type JsxFragment,
  type JsxSelfClosingElement,
  type SourceFile,
  type ts,
} from "ts-morph";
import { normalize } from "upath";
import type { JsxElementPositions } from "../types";
import { isReactThreeElement } from "./is-three-element";
import { getElementFilePath } from "./module";
import { type SourceFileReadOnly } from "./project";
import {
  globalPropsExclusions,
  threejsPropsExclusions,
} from "./prop-exclusions";
import { getFunctionPropTypes, getJsxElementPropTypes } from "./type-infer";

/**
 * Returns all found jsx elements in a source file, optionally filtered by a
 * specific export.
 *
 * @param sourceFile
 * @param exportName When defined will only return the jsx elements for that
 *   export.
 */
export function getAllJsxElements(
  sourceFile: SourceFileReadOnly,
  exportName?: string,
) {
  let nodeToSearch: SourceFileReadOnly | Node = sourceFile;

  if (exportName) {
    const foundExport = sourceFile
      .getExportSymbols()
      .find((symbol) => symbol.getName() === exportName);

    if (!foundExport) {
      throw new Error(`invariant: export ${exportName} not found`);
    }

    nodeToSearch = resolveExportDeclaration(foundExport.getDeclarations()[0]);
  }

  const jsxElements = nodeToSearch.getDescendantsOfKind(SyntaxKind.JsxElement);
  const jsxSelfClosing = nodeToSearch.getDescendantsOfKind(
    SyntaxKind.JsxSelfClosingElement,
  );
  const jsxFragments = nodeToSearch.getDescendantsOfKind(
    SyntaxKind.JsxFragment,
  );

  const elements: (JsxSelfClosingElement | JsxElement | JsxFragment)[] = [];
  elements.push(...jsxSelfClosing, ...jsxElements, ...jsxFragments);

  return elements;
}

export function getJsxTag(
  node: JsxElement | JsxSelfClosingElement | JsxFragment,
): {
  friendlyName: string;
  name: string | undefined;
  tagName: string;
  type: "custom" | "host";
} {
  if (Node.isJsxFragment(node)) {
    return {
      friendlyName: "Fragment",
      name: "Fragment",
      tagName: "",
      type: "custom",
    };
  }

  const { attributes } = getAttributes(node);
  const tagName = Node.isJsxElement(node)
    ? node.getOpeningElement().getTagNameNode().getText()
    : node.getTagNameNode().getText();
  const type: "host" | "custom" = /^[a-z]/.exec(tagName) ? "host" : "custom";

  if (attributes.name) {
    const nameInitializer = attributes.name.getInitializer();
    const initializerValue = Node.isJsxExpression(nameInitializer)
      ? nameInitializer.getExpression()
      : nameInitializer;

    if (Node.isStringLiteral(initializerValue)) {
      const name = initializerValue.getLiteralText();

      return {
        friendlyName: `${name} (${tagName})`,
        name,
        tagName,
        type,
      };
    }
  }

  return {
    friendlyName: tagName,
    name: undefined,
    tagName,
    type,
  };
}

export function resolveExportDeclaration(node: Node<ts.Node>) {
  if (Node.isExportAssignment(node)) {
    const expression = node.getExpression();
    let declarations: Node<ts.Node>[] | undefined;

    if (Node.isCallExpression(expression)) {
      declarations = expression
        // We make an assumption that the first argument is the component.
        // If anyone uses a custom HOC this won't resolve correctly.
        // Let's cross that bridge later if it comes to it.
        .getArguments()[0]
        .getSymbol()
        ?.getDeclarations();
    } else {
      declarations = expression.getSymbol()?.getDeclarations();
    }

    declarations = declarations?.filter((decl) => {
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
  sourceFile: SourceFileReadOnly,
  exportName: string,
): JsxElementPositions[] {
  const elements: JsxElementPositions[] = [];
  const parentPointers = new Map<Node, JsxElementPositions>();
  const parentPath = normalize(sourceFile.getFilePath());
  const foundExport = sourceFile
    .getExportSymbols()
    .find((symbol) => symbol.getName() === exportName);

  if (!foundExport) {
    throw new Error(`invariant: export ${exportName} not found`);
  }

  const declaration = resolveExportDeclaration(
    foundExport.getDeclarations()[0],
  );

  declaration.forEachDescendant((node) => {
    if (
      Node.isJsxElement(node) ||
      Node.isJsxFragment(node) ||
      Node.isJsxSelfClosingElement(node)
    ) {
      const { column, line } = sourceFile.getLineAndColumnAtPos(
        node.getStart(),
      );
      const tag = getJsxTag(node);
      let positions: JsxElementPositions;

      if (tag.type === "custom") {
        const paths = getElementFilePath(node);
        positions = {
          children: [],
          column,
          exportName: paths.exportName,
          line,
          name: tag.friendlyName,
          parentPath,
          path: paths.filePath,
          type: "custom",
        };
      } else {
        positions = {
          children: [],
          column,
          line,
          name: tag.friendlyName,
          parentPath,
          type: "host",
        };
      }

      const parentElement = node.getFirstAncestor(
        (node) => Node.isJsxElement(node) || Node.isJsxFragment(node),
      );

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

export type AttributesResult = {
  attributes: Record<string, JsxAttribute>;
  children?: JsxChild[];
};

export function getAttributes(
  element: JsxSelfClosingElement | JsxElement | JsxFragment,
): AttributesResult {
  if (Node.isJsxFragment(element)) {
    return {
      attributes: {},
      children: element.getJsxChildren(),
    };
  }

  const attributes = Node.isJsxSelfClosingElement(element)
    ? element.getAttributes()
    : element.getOpeningElement().getAttributes();
  const attrs: AttributesResult = {
    attributes: {},
    children: undefined,
  };
  const jsxChildren = Node.isJsxElement(element)
    ? element.getJsxChildren()
    : [];

  for (let i = 0; i < attributes.length; i++) {
    const attr = attributes[i];
    if (Node.isJsxAttribute(attr)) {
      const propName = attr.getNameNode().getText();
      attrs.attributes[propName] = attr;
    }
  }

  if (jsxChildren.length) {
    attrs.children = jsxChildren;
  }

  return attrs;
}

export function getJsxElementParentExportNameOrThrow(
  element: JsxSelfClosingElement | JsxElement | JsxFragment,
): string {
  const ancestors = element.getAncestors();
  const maxDepth = ancestors.length - 2;

  for (let i = ancestors.length - 1; i >= maxDepth; i--) {
    const ancestor = ancestors[i];
    if (Node.isFunctionDeclaration(ancestor) && ancestor.isExported()) {
      if (ancestor.isDefaultExport()) {
        return "default";
      }

      return ancestor.getNameNodeOrThrow().getText();
    }

    if (Node.isVariableStatement(ancestor)) {
      if (ancestor.isExported()) {
        return ancestor.getDeclarations()[0].getName();
      }

      const decl = ancestor.getFirstDescendantByKind(
        SyntaxKind.VariableDeclaration,
      );

      if (decl) {
        const name = decl.getName();
        const source = element.getSourceFile();
        const exportAssignment = source.getExportAssignment((exp) => {
          const identifiers = exp.getDescendantsOfKind(SyntaxKind.Identifier);
          return identifiers.some((id) => id.getText() === name);
        });

        if (exportAssignment) {
          return "default";
        }
      }
    }
  }

  throw new Error("invariant: parent export not found");
}

export function getJsxElementProps(
  _: SourceFileReadOnly,
  element: JsxSelfClosingElement | JsxElement | JsxFragment,
) {
  const { elementName, props, transforms } = getJsxElementPropTypes(element);

  const sortedProps = props
    .filter((prop) => {
      if (isReactThreeElement(elementName)) {
        return (
          !threejsPropsExclusions[prop.name] &&
          !globalPropsExclusions[prop.name] &&
          prop.kind !== "unhandled"
        );
      }

      return !globalPropsExclusions[prop.name] && prop.kind !== "unhandled";
    })
    .sort((propA, propB) => {
      return propA.name.localeCompare(propB.name);
    });

  return { props: sortedProps, transforms };
}

export function getFunctionProps(
  sourceFile: SourceFileReadOnly,
  exportName: string,
) {
  const { props, transforms } = getFunctionPropTypes(sourceFile, exportName);
  return { props, transforms };
}

export function getJsxElementAt(
  sourceFile: SourceFileReadOnly,
  line: number,
  column: number,
) {
  try {
    const sceneObject = getAllJsxElements(sourceFile).find((node) => {
      const pos = sourceFile.getLineAndColumnAtPos(node.getStart());
      return pos.line === line && pos.column === column;
    });

    return sceneObject;
  } catch {
    return undefined;
  }
}

export function getJsxElementAtOrThrow(
  sourceFile: SourceFile,
  line: number,
  column: number,
) {
  const sceneObject = getJsxElementAt(sourceFile, line, column);
  if (!sceneObject) {
    throw new Error("invariant: not found");
  }

  return sceneObject;
}
