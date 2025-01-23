/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import type { NodePath, PluginObj } from "@babel/core";
import * as t from "@babel/types";
import type { SceneMeta } from "@triplex/bridge/client";
import { normalize } from "upath";
import {
  extractFunctionArgs,
  importIfMissing,
  isChildOfReturnStatement,
  isJSXIdentifierFromNodeModules,
} from "./util/babel";
import { isReactDOMElement } from "./util/is-react-element";
import {
  isCanvasFromThreeFiber,
  isComponentFromThreeFiber,
  isHookFromThreeFiber,
  isReactThreeElement,
} from "./util/is-three-element";

const AUTOMATIC_JSX_RUNTIME = ["jsx", "jsxs", "_jsx", "_jsxs"];
const SCENE_OBJECT_COMPONENT_NAME = "SceneObject";

interface ComponentMetadata {
  lighting: SceneMeta["lighting"];
  root: "react" | "react-three-fiber" | t.Expression | undefined;
}

function resolveOrderingFromMap(dependencyMap: Map<string, string>) {
  const order: string[] = [];
  const visited = new Set<string>();

  function visit(name: string) {
    if (visited.has(name)) {
      return;
    }

    visited.add(name);

    const dependency = dependencyMap.get(name);

    if (dependency) {
      visit(dependency);
    }

    order.push(name);
  }

  dependencyMap.forEach((_, name) => visit(name));

  return order;
}

export default function triplexBabelPlugin({
  cwd = process.cwd(),
  exclude: excludeDirs,
  skipFunctionMeta,
}: {
  cwd?: string;
  exclude: string[];
  skipFunctionMeta?: boolean;
}) {
  const cache = new WeakSet();
  const componentsFoundInPass = new Map<string, ComponentMetadata>();
  const componentMetaDependencyMap = new Map<string, string>();
  const exclude = excludeDirs.filter(Boolean);

  let shouldSkip = false;
  let shouldImportFragment = false;
  let currentFunction:
    | {
        canvasComponent?: boolean;
        firstFoundCustomComponentName?: string;
        firstFoundHookSource?: "react-three-fiber";
        firstFoundHostElementSource?: "react" | "react-three-fiber";
        name: string;
        props: {
          destructured: string[];
          spreadIdentifier?: string;
        };
        returnsJSX: boolean;
      }
    | undefined = undefined;

  function initializeMetaForCurrentFunction() {
    if (
      !skipFunctionMeta &&
      currentFunction &&
      !componentsFoundInPass.has(currentFunction.name)
    ) {
      componentsFoundInPass.set(currentFunction.name, {
        lighting: "default",
        root: undefined,
      });
    }
  }

  function resetCurrentFunction(
    path: NodePath<t.VariableDeclarator | t.FunctionDeclaration>,
  ) {
    if (
      path.node.id?.type === "Identifier" &&
      path.node.id.name === currentFunction?.name &&
      !skipFunctionMeta
    ) {
      const meta = componentsFoundInPass.get(currentFunction.name)!;

      if (currentFunction.canvasComponent) {
        meta.root = "react";
      } else if (currentFunction.firstFoundHookSource) {
        meta.root = "react-three-fiber";
      } else if (
        currentFunction.firstFoundHostElementSource &&
        currentFunction.firstFoundCustomComponentName
      ) {
        meta.root = t.logicalExpression(
          "||",
          t.memberExpression(
            t.memberExpression(
              t.identifier(currentFunction.firstFoundCustomComponentName),
              t.identifier("triplexMeta"),
            ),
            t.identifier("root"),
          ),
          t.stringLiteral(currentFunction.firstFoundHostElementSource),
        );
      } else if (currentFunction.firstFoundHostElementSource) {
        meta.root = currentFunction.firstFoundHostElementSource;
      } else if (currentFunction.firstFoundCustomComponentName) {
        meta.root = t.memberExpression(
          t.memberExpression(
            t.identifier(currentFunction.firstFoundCustomComponentName),
            t.identifier("triplexMeta"),
          ),
          t.identifier("root"),
        );
      } else if (currentFunction.returnsJSX) {
        meta.root = "react";
      }

      if (currentFunction.firstFoundCustomComponentName) {
        componentMetaDependencyMap.set(
          currentFunction.name,
          currentFunction.firstFoundCustomComponentName,
        );
      }

      currentFunction = undefined;
    }
  }

  const plugin: PluginObj = {
    visitor: {
      CallExpression(path) {
        if (currentFunction) {
          const callee = path.get("callee");

          if (callee.isIdentifier() && isHookFromThreeFiber(callee)) {
            currentFunction.firstFoundHookSource ??= "react-three-fiber";
          }
        }

        if (
          path.node.callee.type === "MemberExpression" &&
          path.node.callee.object.type === "Identifier" &&
          path.node.callee.object.name !== "document" &&
          path.node.callee.property.type === "Identifier" &&
          path.node.callee.property.name === "createElement" &&
          path.node.arguments.length >= 2 &&
          t.isExpression(path.node.arguments[0]) &&
          !cache.has(path.node)
        ) {
          // We've found a classic runtime transformed JSX
          const elementName =
            path.node.arguments[0].type === "StringLiteral"
              ? path.node.arguments[0].value
              : "unknown";
          const props = path.node.arguments[1];
          const componentArg = path.node.arguments[0];

          const newNode = t.callExpression(path.node.callee, [
            t.identifier(SCENE_OBJECT_COMPONENT_NAME),
            t.objectExpression([
              // Since the current props can be manually created it could be anything.
              // We spread it in instead of taking its properties.
              t.spreadElement(
                t.isExpression(props) ? props : t.identifier("undefined"),
              ),
              t.objectProperty(t.identifier("__component"), componentArg),
              t.objectProperty(
                t.identifier("__meta"),
                t.objectExpression([
                  t.objectProperty(
                    t.stringLiteral("path"),
                    t.stringLiteral(""),
                  ),
                  t.objectProperty(
                    t.stringLiteral("name"),
                    t.stringLiteral(elementName),
                  ),
                  t.objectProperty(
                    t.stringLiteral("line"),
                    t.numericLiteral(-2),
                  ),
                  t.objectProperty(
                    t.stringLiteral("column"),
                    t.numericLiteral(-2),
                  ),
                ]),
              ),
            ]),
            ...path.node.arguments.slice(2),
          ]);

          // Mark the node as transformed to not get into an infinite loop.
          cache.add(newNode);
          path.replaceWith(newNode);
        }

        if (
          // Basic jsx() calls
          ((path.node.callee.type === "Identifier" &&
            AUTOMATIC_JSX_RUNTIME.includes(path.node.callee.name)) ||
            // OR basic jsxRuntime.jsx() calls.
            (path.node.callee.type === "MemberExpression" &&
              path.node.callee.property.type === "Identifier" &&
              AUTOMATIC_JSX_RUNTIME.includes(path.node.callee.property.name)) ||
            // OR mangled (0, jsxRuntime.jsx) calls.
            (path.node.callee.type === "SequenceExpression" &&
              path.node.callee.expressions[1].type === "MemberExpression" &&
              path.node.callee.expressions[1].property.type === "Identifier" &&
              AUTOMATIC_JSX_RUNTIME.includes(
                path.node.callee.expressions[1].property.name,
              ))) &&
          t.isExpression(path.node.arguments[0]) &&
          !cache.has(path.node)
        ) {
          // We've found the transformed automatic runtime for ESM
          const elementName =
            path.node.arguments[0].type === "StringLiteral"
              ? path.node.arguments[0].value
              : "unknown";
          const props = path.node.arguments[1];
          const componentArg = path.node.arguments[0];

          const newNode = t.callExpression(path.node.callee, [
            t.identifier(SCENE_OBJECT_COMPONENT_NAME),
            t.objectExpression([
              ...(t.isObjectExpression(props) ? props.properties : []),
              t.objectProperty(t.identifier("__component"), componentArg),
              t.objectProperty(
                t.identifier("__meta"),
                t.objectExpression([
                  t.objectProperty(
                    t.stringLiteral("path"),
                    t.stringLiteral(""),
                  ),
                  t.objectProperty(
                    t.stringLiteral("name"),
                    t.stringLiteral(elementName),
                  ),
                  t.objectProperty(
                    t.stringLiteral("line"),
                    t.numericLiteral(-2),
                  ),
                  t.objectProperty(
                    t.stringLiteral("column"),
                    t.numericLiteral(-2),
                  ),
                ]),
              ),
            ]),
            ...path.node.arguments.slice(2),
          ]);

          // Mark the node as transformed to not get into an infinite loop.
          cache.add(newNode);
          path.replaceWith(newNode);
        }
      },
      FunctionDeclaration: {
        enter(path) {
          if (
            shouldSkip ||
            !path.node.id ||
            !/^[A-Z]/.exec(path.node.id.name)
          ) {
            return;
          }

          const propsArg = path.node.params[0];
          const { destructured, spreadIdentifier } =
            extractFunctionArgs(propsArg);

          currentFunction = {
            name: path.node.id.name,
            props: { destructured, spreadIdentifier },
            returnsJSX: false,
          };

          initializeMetaForCurrentFunction();
        },
        exit(path) {
          resetCurrentFunction(path);
        },
      },
      JSXElement(path, pass) {
        if (shouldSkip) {
          return;
        }

        if (
          cache.has(path.node) ||
          path.node.openingElement.name.type !== "JSXIdentifier" ||
          !path.node.loc
        ) {
          return;
        }

        cache.add(path.node);

        const elementName = path.node.openingElement.name.name;
        const elementType = /^[A-Z]/.exec(elementName) ? "custom" : "host";
        const functionMeta =
          currentFunction && componentsFoundInPass.get(currentFunction.name);

        if (functionMeta && currentFunction) {
          currentFunction.returnsJSX = true;

          if (elementName.endsWith("Light")) {
            functionMeta.lighting = "custom";
          }

          if (isChildOfReturnStatement(path)) {
            if (elementType === "custom") {
              if (isCanvasFromThreeFiber(path)) {
                currentFunction.canvasComponent = true;
              } else if (isComponentFromThreeFiber(path)) {
                currentFunction.firstFoundHostElementSource ??=
                  "react-three-fiber";
              } else if (
                !isJSXIdentifierFromNodeModules(path, cwd) &&
                elementName !== currentFunction.name
              ) {
                currentFunction.firstFoundCustomComponentName = elementName;
              }
            } else if (isReactDOMElement(elementName)) {
              currentFunction.firstFoundHostElementSource ??= "react";
            } else if (isReactThreeElement(elementName)) {
              currentFunction.firstFoundHostElementSource ??=
                "react-three-fiber";
            }
          }
        }

        const line = path.node.loc.start.line;
        // Align to tsc where column numbers start from 1
        const column = path.node.loc.start.column + 1;

        const transformsFound = {
          rotate: false,
          scale: false,
          translate: false,
        };

        const attributes = path.node.openingElement.attributes.filter(
          (attr) => {
            if (attr.type === "JSXAttribute") {
              if (
                elementType === "host" ||
                isJSXIdentifierFromNodeModules(path, cwd)
              ) {
                const isIdentifierFromDestructuredProps =
                  attr.value?.type === "JSXExpressionContainer" &&
                  attr.value.expression.type === "Identifier" &&
                  currentFunction?.props.destructured.includes(
                    attr.value.expression.name,
                  );

                const isPropsMemberExpression =
                  attr.value?.type === "JSXExpressionContainer" &&
                  attr.value.expression.type === "MemberExpression" &&
                  attr.value.expression.object.type === "Identifier" &&
                  attr.value.expression.object.name ===
                    currentFunction?.props.spreadIdentifier;

                if (
                  isIdentifierFromDestructuredProps ||
                  isPropsMemberExpression
                ) {
                  if (attr.name.name === "position") {
                    transformsFound.translate = true;
                  }

                  if (attr.name.name === "rotation") {
                    transformsFound.rotate = true;
                  }

                  if (attr.name.name === "scale") {
                    transformsFound.scale = true;
                  }
                }
              }
            } else {
              // Spread attribute
              if (
                attr.argument.type === "Identifier" &&
                attr.argument.name === currentFunction?.props.spreadIdentifier
              ) {
                if (!currentFunction.props.destructured.includes("position")) {
                  transformsFound.translate = true;
                }

                if (!currentFunction.props.destructured.includes("rotation")) {
                  transformsFound.rotate = true;
                }

                if (!currentFunction.props.destructured.includes("scale")) {
                  transformsFound.scale = true;
                }
              }
            }

            return true;
          },
        );

        const newNode = t.jsxElement(
          t.jsxOpeningElement(t.jsxIdentifier(SCENE_OBJECT_COMPONENT_NAME), [
            ...attributes,
            t.jsxAttribute(
              t.jsxIdentifier("__component"),
              t.jsxExpressionContainer(
                elementType === "custom"
                  ? t.identifier(elementName)
                  : t.stringLiteral(elementName),
              ),
            ),
            t.jsxAttribute(
              t.jsxIdentifier("__meta"),
              t.jsxExpressionContainer(
                t.objectExpression([
                  t.objectProperty(
                    t.stringLiteral("path"),
                    t.stringLiteral(
                      pass.filename ? normalize(pass.filename) : "",
                    ),
                  ),
                  t.objectProperty(
                    t.stringLiteral("name"),
                    t.stringLiteral(elementName),
                  ),
                  t.objectProperty(
                    t.stringLiteral("line"),
                    t.numericLiteral(line),
                  ),
                  t.objectProperty(
                    t.stringLiteral("column"),
                    t.numericLiteral(column),
                  ),
                  t.objectProperty(
                    t.stringLiteral("translate"),
                    t.booleanLiteral(transformsFound.translate),
                  ),
                  t.objectProperty(
                    t.stringLiteral("rotate"),
                    t.booleanLiteral(transformsFound.rotate),
                  ),
                  t.objectProperty(
                    t.stringLiteral("scale"),
                    t.booleanLiteral(transformsFound.scale),
                  ),
                ]),
              ),
            ),
          ]),
          t.jsxClosingElement(t.jsxIdentifier(SCENE_OBJECT_COMPONENT_NAME)),
          path.node.children,
        );

        path.replaceWith(newNode);
      },
      JSXFragment(path, pass) {
        if (shouldSkip) {
          return;
        }

        if (cache.has(path.node) || !path.node.loc) {
          return;
        }

        shouldImportFragment = true;
        cache.add(path.node);

        const line = path.node.loc.start.line;
        // Align to tsc where column numbers start from 1
        const column = path.node.loc.start.column + 1;

        const newNode = t.jsxElement(
          t.jsxOpeningElement(t.jsxIdentifier(SCENE_OBJECT_COMPONENT_NAME), [
            t.jsxAttribute(
              t.jsxIdentifier("__component"),
              t.jsxExpressionContainer(t.identifier("Fragment")),
            ),
            t.jsxAttribute(
              t.jsxIdentifier("__meta"),
              t.jsxExpressionContainer(
                t.objectExpression([
                  t.objectProperty(
                    t.stringLiteral("path"),
                    t.stringLiteral(
                      pass.filename ? normalize(pass.filename) : "",
                    ),
                  ),
                  t.objectProperty(
                    t.stringLiteral("name"),
                    t.stringLiteral("Fragment"),
                  ),
                  t.objectProperty(
                    t.stringLiteral("line"),
                    t.numericLiteral(line),
                  ),
                  t.objectProperty(
                    t.stringLiteral("column"),
                    t.numericLiteral(column),
                  ),
                ]),
              ),
            ),
          ]),
          t.jsxClosingElement(t.jsxIdentifier(SCENE_OBJECT_COMPONENT_NAME)),
          path.node.children,
        );

        path.replaceWith(newNode);
      },
      Program: {
        enter(_, state) {
          const normalizedPath = normalize(state.filename || "");
          if (exclude.some((file) => normalizedPath.includes(file))) {
            shouldSkip = true;
          }
        },
        exit(path) {
          if (!shouldSkip) {
            const importDeclarations = path
              .get("body")
              .filter((path) => path.isImportDeclaration());
            importDeclarations.forEach((path) => {
              const isReactThreeFiberImport =
                path.node.source.value === "@react-three/fiber";

              if (!isReactThreeFiberImport) {
                return;
              }

              const [canvasImportSpecifier] = path
                .get("specifiers")
                .filter(
                  (spec) =>
                    spec.node.type === "ImportSpecifier" &&
                    spec.node.imported.type === "Identifier" &&
                    spec.node.imported.name === "Canvas",
                );

              if (canvasImportSpecifier) {
                path.insertAfter(
                  t.importDeclaration(
                    [canvasImportSpecifier.node],
                    t.stringLiteral("triplex:canvas"),
                  ),
                );
                canvasImportSpecifier.remove();
              }
            });
          }

          const componentMetaOrder = resolveOrderingFromMap(
            componentMetaDependencyMap,
          );

          Array.from(componentsFoundInPass.entries())
            .sort(([nameA], [nameB]) => {
              return (
                componentMetaOrder.indexOf(nameA) -
                componentMetaOrder.indexOf(nameB)
              );
            })
            .map(([componentName, meta]) => {
              path.pushContainer(
                "body",
                t.expressionStatement(
                  t.assignmentExpression(
                    "=",
                    t.memberExpression(
                      t.identifier(componentName),
                      t.identifier("triplexMeta"),
                    ),
                    t.objectExpression(
                      Object.entries(meta).map(([key, value]) => {
                        return t.objectProperty(
                          t.stringLiteral(key),
                          typeof value === "string"
                            ? t.stringLiteral(value)
                            : value === undefined
                              ? t.identifier("undefined")
                              : value,
                        );
                      }),
                    ),
                  ),
                ),
              );
            });

          if (shouldImportFragment) {
            importIfMissing(path, "react", "Fragment");
          }

          shouldSkip = false;
          shouldImportFragment = false;
          componentsFoundInPass.clear();
          componentMetaDependencyMap.clear();
        },
      },
      VariableDeclarator: {
        enter(path) {
          if (
            shouldSkip ||
            path.node.id.type !== "Identifier" ||
            !/^[A-Z]/.exec(path.node.id.name)
          ) {
            return;
          }

          let destructured: string[] = [];
          let spreadIdentifier: string | undefined = undefined;
          let isFunction = false;

          path.traverse({
            ArrowFunctionExpression(innerPath) {
              const propsArg = innerPath.node.params[0];
              ({ destructured, spreadIdentifier } =
                extractFunctionArgs(propsArg));
              isFunction = true;
              innerPath.stop();
            },
            FunctionExpression(innerPath) {
              const propsArg = innerPath.node.params[0];
              ({ destructured, spreadIdentifier } =
                extractFunctionArgs(propsArg));
              isFunction = true;
              innerPath.stop();
            },
          });

          if (isFunction) {
            currentFunction = {
              name: path.node.id.name,
              props: { destructured, spreadIdentifier },
              returnsJSX: false,
            };

            initializeMetaForCurrentFunction();
          }
        },
        exit(path) {
          resetCurrentFunction(path);
        },
      },
    },
  };

  return plugin;
}
