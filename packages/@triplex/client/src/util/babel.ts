/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { type NodePath, type PluginPass } from "@babel/core";
import * as t from "@babel/types";
import { dirname, extname, resolve } from "upath";

export function isIdentifierFromModule(
  path: NodePath<t.Identifier>,
  moduleName: string,
) {
  const importSpecifier = resolveIdentifierImportSpecifier(path);
  if (
    importSpecifier &&
    importSpecifier.parentPath.isImportDeclaration() &&
    importSpecifier.parentPath.node.source.value === moduleName
  ) {
    return true;
  }

  return false;
}

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

export function importIfMissing(
  pass: NodePath<t.Program>,
  module: string,
  namedImport: string,
) {
  if (
    pass.scope.hasBinding(namedImport) ||
    pass.scope.hasGlobal(namedImport) ||
    pass.scope.hasReference(namedImport)
  ) {
    return;
  }

  pass.node.body.unshift(
    t.importDeclaration(
      [t.importSpecifier(t.identifier(namedImport), t.identifier(namedImport))],
      t.stringLiteral(module),
    ),
  );
}

export function resolveIdentifierExportName(
  path: NodePath<t.Node>,
  identifierName: string,
) {
  const foundExport = path.scope
    .getBinding(identifierName)
    ?.referencePaths.map((path) => {
      if (
        path.parentPath?.isExportDeclaration() ||
        path.parentPath?.isExportDefaultDeclaration() ||
        path.parentPath?.isExportSpecifier() ||
        path.parentPath?.isExportDefaultSpecifier()
      ) {
        return path.parentPath;
      }

      return path;
    })
    .find(
      (path) =>
        path.isExportDefaultDeclaration() ||
        path.isExportDeclaration() ||
        path.isExportSpecifier() ||
        path.isExportDefaultSpecifier(),
    );

  if (!foundExport) {
    return "";
  }

  if (
    foundExport.isExportDefaultDeclaration() ||
    foundExport.isExportDefaultSpecifier()
  ) {
    return "default";
  } else if (
    foundExport.isExportDeclaration() ||
    foundExport.isExportSpecifier()
  ) {
    return identifierName;
  }

  return "";
}

export function resolvePath(root: string | undefined, path: string) {
  if (path.startsWith(".")) {
    // Relative path
    return resolve(dirname(root || "/"), path) + extname(root || "");
  } else if (path.startsWith("/")) {
    // Absolute path
    return path;
  }

  /**
   * Any custom paths that could start with e.g. ~ aren't supported right now as
   * they rely on tsconfig-paths and we're aren't resolving the pats through it
   * atm. This means not being able to "enter" those components via double
   * clicking on the element in the tree. If we get feedback saying this is a
   * problem we can add support for it later.
   */
  return "";
}

export function resolveIdentifierOrigin(
  pass: PluginPass,
  path: NodePath<t.Node>,
  identifierName: string,
) {
  const exportName = resolveIdentifierExportName(path, identifierName);

  if (exportName) {
    // We found a local component
    return {
      exportName,
      path: pass.filename || "",
    };
  }

  // Look for local imports
  const binding = path.scope.getBinding(identifierName);
  if (
    binding?.path.isImportSpecifier() &&
    binding.path.node.imported.type === "Identifier" &&
    binding.path.parentPath.isImportDeclaration()
  ) {
    return {
      exportName: binding.path.node.imported.name,
      path: resolvePath(
        pass.filename,
        binding.path.parentPath.node.source.value,
      ),
    };
  }

  if (
    binding?.path.isImportDefaultSpecifier() &&
    binding.path.parentPath.isImportDeclaration()
  ) {
    return {
      exportName: "default",
      path: resolvePath(
        pass.filename,
        binding.path.parentPath.node.source.value,
      ),
    };
  }

  return undefined;
}
