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
import { components } from "triplex:components";
import { ComponentType } from "./api-types";
import { SceneObject } from "./scene-object";

/**
 * - Blow it away on hot module reload
 */
export function AddSceneObject({ path }: { path: string }) {
  const [addedComponents, setAddedComponents] = useState<ComponentType[]>([]);
  const [positions, setPositions] = useState<
    { column: number; line: number }[]
  >([]);
  const lazyRef = useRef<LazyExoticComponent<CT<unknown>>[]>([]);

  useEffect(() => {
    return listen("trplx:requestAddNewComponent", (component) => {
      let index = -1;

      setAddedComponents((value) => {
        index = value.length;
        return value.concat(component);
      });
      send("trplx:onAddNewComponent", component, true).then((res) => {
        setPositions((prev) => {
          const next = prev.concat([]);
          next[index] = res;
          return next;
        });
      });
    });
  }, []);

  return (
    <>
      {addedComponents.map((component, index) => {
        const pos = positions[index] || { column: -1, line: -1 };

        switch (component.type) {
          case "host": {
            return (
              <SceneObject
                key={index}
                {...component.props}
                __component={component.name}
                __meta={{
                  column: pos.column,
                  line: pos.line,
                  name: component.name,
                  path,
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

            if (!lazyRef.current[index]) {
              lazyRef.current[index] = lazy(() =>
                found[1]().then((x) => ({ default: x[component.exportName] }))
              );
            }

            const LazyComponent = lazyRef.current[index];

            return (
              <Suspense key={index} fallback={null}>
                <SceneObject
                  {...component.props}
                  __component={LazyComponent}
                  __meta={{
                    column: pos.column,
                    line: pos.line,
                    name: component.exportName,
                    path,
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
