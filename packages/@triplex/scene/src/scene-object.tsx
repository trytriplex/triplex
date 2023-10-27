/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { Object3DProps } from "@react-three/fiber";
import { compose, listen } from "@triplex/bridge/client";
import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { Group } from "three";
import { getHelperForElement, Helper } from "./components/helper";
import { useSelectSceneObject } from "./selection";
import { useOnSceneObjectMount } from "./stores/selection";

function useForceRender() {
  const [, setState] = useState(false);
  return useCallback(() => setState((prev) => !prev), []);
}

function isRenderedSceneObject(
  name: string,
  props: Record<string, unknown>
): boolean {
  const exclusions = ["Material", "Geometry", "Attribute", "__exclude__"];
  if (
    // If the scene object has an attach prop it's not actually rendered to the scene
    // But instead attached to the parent object in the R3F tree.
    props.attach ||
    exclusions.some((n) => name.includes(n))
  ) {
    return false;
  }

  return true;
}

function useSceneObjectProps(
  meta: SceneObjectProps["__meta"],
  props: Record<string, unknown>
): Record<string, unknown> {
  const forceRender = useForceRender();
  const intermediateProps = useRef<Record<string, unknown>>({});
  const persistedProps = useRef<Record<string, unknown>>({});
  const propsRef = useRef<Record<string, unknown>>({});

  // Assign all current top-level props to a ref so we can access it in an effect.
  Object.assign(propsRef.current, props, persistedProps.current);

  useEffect(() => {
    import.meta.hot?.on("vite:afterUpdate", (e) => {
      const isUpdated = e.updates.find((up) => meta.path?.endsWith(up.path));
      if (isUpdated) {
        // On HMR clear out the intermediate state so when it's rendered again
        // It'll use the latest values from source.
        intermediateProps.current = {};
      }
    });
  }, [meta.path]);

  useEffect(() => {
    return compose([
      listen("trplx:requestReset", () => {
        if (Object.keys(intermediateProps.current).length) {
          intermediateProps.current = {};
          forceRender();
        }
      }),
      listen("trplx:requestSceneObjectPropValue", (data) => {
        if (
          data.column === meta.column &&
          data.line === meta.line &&
          data.path === meta.path
        ) {
          const prop = {
            value: propsRef.current[data.propName],
          };

          return prop;
        }
      }),
      listen("trplx:requestSetSceneObjectProp", (data) => {
        if (
          "column" in data &&
          data.column === meta.column &&
          data.line === meta.line &&
          data.path === meta.path
        ) {
          intermediateProps.current[data.propName] = data.propValue;
          forceRender();
        }
      }),
      listen("trplx:requestPersistSceneObjectProp", (data) => {
        if (
          data.column === meta.column &&
          data.line === meta.line &&
          data.path === meta.path
        ) {
          persistedProps.current[data.propName] = data.propValue;
        }
      }),
      listen("trplx:requestResetSceneObjectProp", (data) => {
        if (
          data.column === meta.column &&
          data.line === meta.line &&
          data.path === meta.path
        ) {
          delete intermediateProps.current[data.propName];
          forceRender();
        }
      }),
    ]);
  }, [meta.column, meta.line, meta.name, meta.path, forceRender]);

  const nextProps = { ...props, ...intermediateProps.current };

  for (const key in nextProps) {
    const value = nextProps[key];
    if (value === undefined) {
      // If the value is undefined we remove it from props altogether.
      // If props are spread onto the host jsx element in r3f this means it
      // gets completely removed and r3f will reset its value back to default.
      // For props directly assigned we instead transform it in the babel plugin
      // to be conditionally applied instead.
      delete nextProps[key];
    }
  }

  return nextProps;
}

export interface SceneObjectProps extends Object3DProps {
  __component:
    | React.ComponentType<{ children?: unknown; ref?: unknown }>
    | string;
  __meta: {
    column: number;
    line: number;
    name: string;
    path: string;
    rotate: boolean;
    scale: boolean;
    // These props are only set if the scene object is a host component
    // and has {position/scale/rotation} set statically (not through spread props).
    translate: boolean;
  };
}

export const SceneObject = forwardRef<unknown, SceneObjectProps>(
  ({ __component: Component, __meta, ...props }, ref) => {
    const { children, ...reconciledProps } = useSceneObjectProps(__meta, props);
    const [isDeleted, setIsDeleted] = useState(false);
    const parentRef = useRef<Group>(null);
    const selectSceneObject = useSelectSceneObject();
    const onSceneObjectMount = useOnSceneObjectMount();

    useEffect(() => {
      return compose([
        listen("trplx:requestDeleteSceneObject", (data) => {
          if (
            data.column === __meta.column &&
            data.line === __meta.line &&
            data.parentPath === __meta.path
          ) {
            setIsDeleted(true);
          }
        }),
        listen("trplx:requestRestoreSceneObject", (data) => {
          if (
            data.column === __meta.column &&
            data.line === __meta.line &&
            data.parentPath === __meta.path
          ) {
            setIsDeleted(false);
          }
        }),
      ]);
    }, [__meta.column, __meta.line, __meta.path]);

    useEffect(() => {
      onSceneObjectMount(__meta.path, __meta.line, __meta.column);
    }, [__meta.column, __meta.line, __meta.path, onSceneObjectMount]);

    if (isRenderedSceneObject(__meta.name, props)) {
      const helper = getHelperForElement(__meta.name);
      const userData = { triplexSceneMeta: { ...__meta, props } };

      return (
        <>
          <group ref={parentRef} userData={userData} visible={!isDeleted}>
            <Component ref={ref} {...reconciledProps}>
              {children}
            </Component>
          </group>
          {helper && !isDeleted && (
            <Helper
              args={helper[1]}
              helperName={helper[0]}
              onClick={(e) => {
                if (e.delta > 1 || !parentRef.current) {
                  return;
                }

                e.stopPropagation();
                selectSceneObject(parentRef.current.children[0]);
              }}
              parentObject={parentRef}
            />
          )}
        </>
      );
    } else if (!isDeleted) {
      return (
        <Component ref={ref} {...reconciledProps}>
          {children}
        </Component>
      );
    }

    // This component will eventually unmount when deleted as its removed
    // from source code. To keep things snappy however we delete it optimistically.
    return null;
  }
);

SceneObject.displayName = "SceneObject";
