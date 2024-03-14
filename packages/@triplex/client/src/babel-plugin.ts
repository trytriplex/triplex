/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import type { NodePath, PluginObj } from "@babel/core";
// eslint-disable-next-line import/no-namespace
import * as t from "@babel/types";
import { normalize } from "upath";

const AUTOMATIC_JSX_RUNTIME = ["jsx", "jsxs", "_jsx", "_jsxs"];

function isNodeModulesComponent(
  path: NodePath,
  elementName: string,
  cwd: string
) {
  try {
    const binding = path.scope.getBinding(elementName);
    if (binding && binding.path.parent.type === "ImportDeclaration") {
      const location = require.resolve(binding.path.parent.source.value, {
        paths: [cwd],
      });
      return location.includes("node_modules");
    }
  } catch {
    // Ignore
  }

  return false;
}

export default function triplexBabelPlugin({
  cwd = process.cwd(),
  exclude: excludeDirs,
}: {
  cwd?: string;
  exclude: string[];
}) {
  const SCENE_OBJECT_COMPONENT_NAME = "SceneObject";
  const cache = new WeakSet();
  const triplexMeta = new Map<string, { lighting: "default" | "custom" }>();
  const exclude = excludeDirs.filter(Boolean);

  let shouldSkip = false;
  let currentFunction:
    | {
        name: string;
        props: { destructured: string[]; spreadIdentifier?: string };
      }
    | undefined = undefined;

  const plugin: PluginObj = {
    visitor: {
      CallExpression(path) {
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
                t.isExpression(props) ? props : t.identifier("undefined")
              ),
              t.objectProperty(t.identifier("__component"), componentArg),
              t.objectProperty(
                t.identifier("__meta"),
                t.objectExpression([
                  t.objectProperty(
                    t.stringLiteral("path"),
                    t.stringLiteral("")
                  ),
                  t.objectProperty(
                    t.stringLiteral("name"),
                    t.stringLiteral(elementName)
                  ),
                  t.objectProperty(
                    t.stringLiteral("line"),
                    t.numericLiteral(-2)
                  ),
                  t.objectProperty(
                    t.stringLiteral("column"),
                    t.numericLiteral(-2)
                  ),
                ])
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
                path.node.callee.expressions[1].property.name
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
                    t.stringLiteral("")
                  ),
                  t.objectProperty(
                    t.stringLiteral("name"),
                    t.stringLiteral(elementName)
                  ),
                  t.objectProperty(
                    t.stringLiteral("line"),
                    t.numericLiteral(-2)
                  ),
                  t.objectProperty(
                    t.stringLiteral("column"),
                    t.numericLiteral(-2)
                  ),
                ])
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
          if (shouldSkip) {
            return;
          }

          if (path.node.id && /^[A-Z]/.exec(path.node.id.name)) {
            const propsArg = path.node.params[0];
            const destructured: string[] = [];
            let spreadIdentifier: string | undefined = undefined;

            switch (propsArg?.type) {
              case "Identifier":
                spreadIdentifier = propsArg.name;
                break;

              case "ObjectPattern":
                propsArg.properties.forEach((prop) => {
                  if (
                    prop.type === "ObjectProperty" &&
                    prop.key.type === "Identifier"
                  ) {
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

            currentFunction = {
              name: path.node.id.name,
              props: { destructured, spreadIdentifier },
            };
          }
        },
        exit(path) {
          if (path.node.id && path.node.id.name === currentFunction?.name) {
            currentFunction = undefined;
          }
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

        if (currentFunction && !triplexMeta.has(currentFunction.name)) {
          triplexMeta.set(currentFunction.name, { lighting: "default" });
        }

        const elementName = path.node.openingElement.name.name;
        const elementType = /^[A-Z]/.exec(elementName) ? "custom" : "host";

        if (currentFunction && elementName.endsWith("Light")) {
          const meta = triplexMeta.get(currentFunction.name);
          if (meta) {
            meta.lighting = "custom";
          }
        }

        const line = path.node.loc.start.line;
        // Align to tsc where column numbers start from 1
        const column = path.node.loc.start.column + 1;
        // We grab the key node if defined and combine it later in the
        // transform to keep it stable.
        let keyNode: t.Expression | undefined;
        const transformsFound = {
          rotate: false,
          scale: false,
          translate: false,
        };

        const attributes = path.node.openingElement.attributes.filter(
          (attr) => {
            if (attr.type === "JSXAttribute") {
              if (attr.name.name === "key") {
                if (t.isStringLiteral(attr.value)) {
                  keyNode = attr.value;
                } else if (
                  t.isJSXExpressionContainer(attr.value) &&
                  t.isExpression(attr.value.expression)
                ) {
                  keyNode = attr.value.expression;
                }

                return false;
              }

              if (
                elementType === "host" ||
                isNodeModulesComponent(path, elementName, cwd)
              ) {
                if (attr.name.name === "position") {
                  transformsFound.translate = true;
                }

                if (attr.name.name === "rotate") {
                  transformsFound.rotate = true;
                }

                if (attr.name.name === "scale") {
                  transformsFound.scale = true;
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
          }
        );

        const newNode = t.jsxElement(
          t.jsxOpeningElement(t.jsxIdentifier(SCENE_OBJECT_COMPONENT_NAME), [
            ...attributes,
            t.jsxAttribute(
              t.jsxIdentifier("__component"),
              t.jsxExpressionContainer(
                elementType === "custom"
                  ? t.identifier(elementName)
                  : t.stringLiteral(elementName)
              )
            ),
            t.jsxAttribute(
              t.jsxIdentifier("__meta"),
              t.jsxExpressionContainer(
                t.objectExpression([
                  t.objectProperty(
                    t.stringLiteral("path"),
                    t.stringLiteral(
                      pass.filename ? normalize(pass.filename) : ""
                    )
                  ),
                  t.objectProperty(
                    t.stringLiteral("name"),
                    t.stringLiteral(elementName)
                  ),
                  t.objectProperty(
                    t.stringLiteral("line"),
                    t.numericLiteral(line)
                  ),
                  t.objectProperty(
                    t.stringLiteral("column"),
                    t.numericLiteral(column)
                  ),
                  t.objectProperty(
                    t.stringLiteral("translate"),
                    t.booleanLiteral(transformsFound.translate)
                  ),
                  t.objectProperty(
                    t.stringLiteral("rotate"),
                    t.booleanLiteral(transformsFound.rotate)
                  ),
                  t.objectProperty(
                    t.stringLiteral("scale"),
                    t.booleanLiteral(transformsFound.scale)
                  ),
                ])
              )
            ),
            t.jsxAttribute(
              t.jsxIdentifier("key"),
              t.jsxExpressionContainer(
                keyNode
                  ? t.binaryExpression(
                      "+",
                      t.stringLiteral(elementName + line + column),
                      keyNode
                    )
                  : t.stringLiteral(elementName + line + column)
              )
            ),
          ]),
          t.jsxClosingElement(t.jsxIdentifier(SCENE_OBJECT_COMPONENT_NAME)),
          path.node.children
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
          shouldSkip = false;

          for (const [key, value] of triplexMeta) {
            path.pushContainer(
              "body",
              t.expressionStatement(
                t.assignmentExpression(
                  "=",
                  t.memberExpression(
                    t.identifier(key),
                    t.identifier("triplexMeta")
                  ),
                  t.objectExpression([
                    t.objectProperty(
                      t.stringLiteral("lighting"),
                      t.stringLiteral(value.lighting)
                    ),
                  ])
                )
              )
            );
          }

          triplexMeta.clear();
        },
      },
      VariableDeclarator: {
        enter(path) {
          if (shouldSkip) {
            return;
          }

          if (
            path.node.id.type === "Identifier" &&
            /^[A-Z]/.exec(path.node.id.name)
          ) {
            const destructured: string[] = [];
            let spreadIdentifier: string | undefined = undefined;

            path.traverse({
              ArrowFunctionExpression(innerPath) {
                const propsArg = innerPath.node.params[0];

                switch (propsArg?.type) {
                  case "Identifier":
                    spreadIdentifier = propsArg.name;
                    break;

                  case "ObjectPattern":
                    propsArg.properties.forEach((prop) => {
                      if (
                        prop.type === "ObjectProperty" &&
                        prop.key.type === "Identifier"
                      ) {
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
              },
            });

            currentFunction = {
              name: path.node.id.name,
              props: { destructured, spreadIdentifier },
            };
          }
        },
        exit(path) {
          if (
            path.node.id.type === "Identifier" &&
            path.node.id.name === currentFunction?.name
          ) {
            currentFunction = undefined;
          }
        },
      },
    },
  };

  return plugin;
}
