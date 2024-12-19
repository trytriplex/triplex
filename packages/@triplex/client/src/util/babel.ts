/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { type NodePath } from "@babel/core";
import type * as t from "@babel/types";

export function resolveIdentifierImportSpecifier(
  path: NodePath<t.JSXIdentifier | t.Identifier>,
) {
  const name = path.node.name;
  const binding = path.scope.getBinding(name);
  if (
    !binding?.path.isImportSpecifier() &&
    !binding?.path.isImportDefaultSpecifier()
  ) {
    return undefined;
  }

  return binding.path;
}

export function isJSXIdentifierFromNodeModules(
  path: NodePath<t.JSXElement>,
  cwd: string,
) {
  const identifier = path.get("openingElement").get("name");
  if (!identifier.isJSXIdentifier()) {
    return false;
  }

  const importSpecifierPath = resolveIdentifierImportSpecifier(identifier);
  if (
    !importSpecifierPath ||
    !importSpecifierPath.parentPath.isImportDeclaration()
  ) {
    return false;
  }

  try {
    const location = require.resolve(
      importSpecifierPath.parentPath.node.source.value,
      {
        paths: [cwd],
      },
    );
    return location.includes("node_modules");
  } catch {
    // Ignore
  }

  return false;
}

export function isChildOfReturnStatement(
  path: NodePath<t.JSXElement>,
): boolean {
  if (path.findParent((parent) => parent.isReturnStatement())) {
    return true;
  }

  if (
    path.findParent(
      (parent) =>
        parent.isArrowFunctionExpression() &&
        !parent.get("body").isBlockStatement(),
    )
  ) {
    return true;
  }

  return false;
}

export function extractFunctionArgs(
  args: t.Identifier | t.RestElement | t.Pattern | undefined,
) {
  const destructured: string[] = [];
  let spreadIdentifier: string | undefined = undefined;

  switch (args?.type) {
    case "Identifier":
      spreadIdentifier = args.name;
      break;

    case "ObjectPattern":
      args.properties.forEach((prop) => {
        if (prop.type === "ObjectProperty" && prop.key.type === "Identifier") {
          destructured.push(prop.key.name);
        } else if (
          prop.type === "RestElement" &&
          prop.argument.type === "Identifier"
        ) {
          spreadIdentifier = prop.argument.name;
        }
      });
      break;
  }

  return { destructured, spreadIdentifier };
}
