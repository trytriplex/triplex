/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { compose, on, type RendererElementProps } from "@triplex/bridge/client";
import { forwardRef, useCallback, useEffect, useRef, useState } from "react";

function useForceRender() {
  const [, setState] = useState(false);
  return useCallback(() => setState((prev) => !prev), []);
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
    // @ts-expect-error — ??????
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

    if (isDeleted) {
      // This component will eventually unmount when deleted as its removed
      // from source code. To keep things snappy however we delete it optimistically.
      return null;
    }

    return (
      <Component ref={ref} {...reconciledProps}>
        {children}
      </Component>
    );
  }
);

SceneObject.displayName = "SceneObject";
