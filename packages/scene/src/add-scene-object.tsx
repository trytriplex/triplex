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
import { ComponentType } from "./api-types";
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
  const currentPath = searchParams.get("path") || "";
  const [addedComponents, setAddedComponents] = useState<ComponentType[]>([]);
  const [positions, setPositions] = useState<
    { column: number; line: number }[]
  >([]);
  const cachedLazyComponents = useRef<LazyExoticComponent<CT<unknown>>[]>([]);

  useEffect(() => {
    return listen("trplx:requestAddNewComponent", ({ type, target }) => {
      if (
        (typeof line === "number" || typeof column === "number") &&
        (target?.column !== column ||
          target?.line !== line ||
          path !== currentPath)
      ) {
        // This event has a target but we aren't it - abort early.
        return;
      }

      if (
        target &&
        typeof line === "undefined" &&
        typeof column === "undefined"
      ) {
        // This event has a target but we aren't one - abort early.
        return;
      }

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
    });
  }, [column, line, currentPath, searchParams, path]);

  useEffect(() => {
    import.meta.hot?.on("vite:afterUpdate", (e) => {
      const isUpdated = e.updates.find((up) => currentPath.endsWith(up.path));
      if (isUpdated) {
        // The scene has been persisted to source remove all intermediates.
        setAddedComponents([]);
        setPositions([]);
        cachedLazyComponents.current = [];
      }
    });
  }, [currentPath]);

  return (
    <>
      {addedComponents.map((component, index) => {
        const pos = positions[index] || { column: -1, line: -1 };

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
                  path: currentPath,
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
              throw new Error("invariant: component not found");
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
                    path: currentPath,
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
