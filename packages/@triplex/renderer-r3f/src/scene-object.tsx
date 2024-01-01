/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { compose, on, type RendererElementProps } from "@triplex/bridge/client";
import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { type Group } from "three";
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
  meta: RendererElementProps["__meta"],
  props: Record<string, unknown>
): Record<string, unknown> {
  const forceRender = useForceRender();
  const intermediateProps = useRef<Record<string, unknown>>({});
  const propsRef = useRef<Record<string, unknown>>({});

  // Assign all current top-level props to a ref so we can access it in an effect.
  Object.assign(propsRef.current, props);

  useEffect(() => {
    return compose([
      on("self:request-reset-file", ({ path }) => {
        if (meta.path.endsWith(path)) {
          intermediateProps.current = {};
        }
      }),
      on("request-reset-scene", () => {
        if (Object.keys(intermediateProps.current).length) {
          intermediateProps.current = {};
          forceRender();
        }
      }),
      on("request-set-element-prop", (data) => {
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
      on("request-reset-prop", (data) => {
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

export const SceneObject = forwardRef<unknown, RendererElementProps>(
  ({ __component: Component, __meta, ...props }, ref) => {
    const { children, ...reconciledProps } = useSceneObjectProps(__meta, props);
    const [isDeleted, setIsDeleted] = useState(false);
    const parentRef = useRef<Group>(null);
    const selectSceneObject = useSelectSceneObject();
    const onSceneObjectMount = useOnSceneObjectMount();

    useEffect(() => {
      return compose([
        on("request-delete-element", (data) => {
          if (
            data.column === __meta.column &&
            data.line === __meta.line &&
            data.parentPath === __meta.path
          ) {
            setIsDeleted(true);
          }
        }),
        on("request-restore-element", (data) => {
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

    if (isDeleted) {
      // This component will eventually unmount when deleted as its removed
      // from source code. To keep things snappy however we delete it optimistically.
      return null;
    } else if (isRenderedSceneObject(__meta.name, props)) {
      const helper = getHelperForElement(__meta.name);
      const userData = { triplexSceneMeta: { ...__meta, props } };

      return (
        <>
          <group ref={parentRef} userData={userData}>
            <Component ref={ref} {...reconciledProps}>
              {children}
            </Component>
          </group>
          {helper && (
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
    }

    return (
      <Component ref={ref} {...reconciledProps}>
        {children}
      </Component>
    );
  }
);

SceneObject.displayName = "SceneObject";
