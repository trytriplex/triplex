/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { listen, send } from "@triplex/bridge/client";
import {
  lazy,
  LazyExoticComponent,
  ComponentType as CT,
  Suspense,
  useEffect,
  useRef,
  useState,
} from "react";
import { useSearchParams } from "react-router-dom";
import type { ComponentType } from "@triplex/server";
import { useComponents } from "./context";
import { SceneObject } from "./scene-object";

export function AddSceneObject({
  path,
  line,
  column,
}: {
  path: string;
  line?: number;
  column?: number;
}) {
  const components = useComponents();
  const [searchParams] = useSearchParams();
  const rootPath = searchParams.get("path") || "";
  const [addedComponents, setAddedComponents] = useState<ComponentType[]>([]);
  const [positions, setPositions] = useState<
    { column: number; line: number }[]
  >([]);
  const cachedLazyComponents = useRef<LazyExoticComponent<CT<unknown>>[]>([]);

  useEffect(() => {
    return listen("trplx:requestAddNewComponent", ({ type, target }) => {
      const isMatchingLineCol =
        target?.column === column && target?.line === line;
      const isMatchingPath = target?.path && path === target?.path;
      const isInstanceForTarget = target && isMatchingLineCol && isMatchingPath;
      const isInstanceForNoTarget = !target && isMatchingLineCol;

      if (isInstanceForTarget || isInstanceForNoTarget) {
        let index = -1;

        setAddedComponents((value) => {
          index = value.length;
          return value.concat(type);
        });

        send("trplx:onAddNewComponent", { type, target }, true).then((res) => {
          setPositions((prev) => {
            const next = prev.concat([]);
            next[index] = res;
            return next;
          });
        });
      }
    });
  }, [column, line, searchParams, path]);

  useEffect(() => {
    import.meta.hot?.on("vite:afterUpdate", () => {
      // The fs has been updated so we assume the intermediate state isn't
      // Needed anymore. Blow it away.
      setAddedComponents([]);
      setPositions([]);
      cachedLazyComponents.current = [];
    });
  }, [rootPath]);

  return (
    <>
      {addedComponents.map((component, index) => {
        const pos = positions[index] || { column: -10, line: -10 };

        switch (component.type) {
          case "host": {
            return (
              <SceneObject
                key={component.name + index}
                {...component.props}
                __component={component.name}
                __meta={{
                  column: pos.column,
                  line: pos.line,
                  name: component.name,
                  path: rootPath,
                  // Host elements have these set but generally only for
                  // the elements that have the appropriate transform props explicitly set.
                  // For this we assume everything is allowed since it's being added.
                  rotate: true,
                  scale: true,
                  translate: true,
                }}
              />
            );
          }

          case "custom": {
            const found = Object.entries(components).find(([key]) =>
              component.path.endsWith(key)
            );

            if (!found) {
              throw new Error(
                `invariant: custom component "${component.exportName}" from "${component.path}" not available in registry.`
              );
            }

            if (!cachedLazyComponents.current[index]) {
              cachedLazyComponents.current[index] = lazy(() =>
                found[1]().then((x) => ({ default: x[component.exportName] }))
              );
            }

            const LazyComponent = cachedLazyComponents.current[index];

            return (
              <Suspense key={component.exportName + index} fallback={null}>
                <SceneObject
                  {...component.props}
                  __component={LazyComponent}
                  __meta={{
                    column: pos.column,
                    line: pos.line,
                    name: component.name,
                    path: rootPath,
                    // Custom elements never have these props set.
                    rotate: false,
                    scale: false,
                    translate: false,
                  }}
                />
              </Suspense>
            );
          }
        }
      })}
    </>
  );
}
