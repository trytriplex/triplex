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

function isNodeModulesComponent(path: NodePath, elementName: string) {
  try {
    const binding = path.scope.getBinding(elementName);
    if (binding && binding.path.parent.type === "ImportDeclaration") {
      const location = require.resolve(binding.path.parent.source.value);
      return location.includes("node_modules");
    }
  } catch {
    // Ignore
  }

  return false;
}

export default function triplexBabelPlugin({ exclude }: { exclude: string[] }) {
  const cache = new WeakSet();
  const triplexMeta = new Map<string, { lighting: "default" | "custom" }>();
  const SCENE_OBJECT_COMPONENT_NAME = "SceneObject";

  let shouldSkip = false;
  let currentFunction:
    | {
        name: string;
        props: { destructured: string[]; spreadIdentifier?: string };
      }
    | undefined = undefined;

  const plugin: PluginObj = {
    visitor: {
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
                isNodeModulesComponent(path, elementName)
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
