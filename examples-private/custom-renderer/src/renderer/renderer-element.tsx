/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { compose, on, type RendererElementProps } from "@triplex/bridge/client";
import { forwardRef, useCallback, useEffect, useRef, useState } from "react";

function useForceRender() {
  const [, setState] = useState(false);
  return useCallback(() => setState((prev) => !prev), []);
}

function useProps(
  meta: RendererElementProps["__meta"],
  props: Record<string, unknown>,
): Record<string, unknown> {
  const forceRender = useForceRender();
  const intermediateProps = useRef<Record<string, unknown>>({});
  const propsRef = useRef<Record<string, unknown>>({});

  // Assign all current top-level props to a ref so we can access it in an effect.
  Object.assign(propsRef.current, props);

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

  return { ...props, ...intermediateProps.current };
}

export const RendererElement = forwardRef<unknown, RendererElementProps>(
  ({ __component: Component, __meta, ...props }, ref) => {
    const { children, ...reconciledProps } = useProps(__meta, props);
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
      return null;
    }

    return (
      <Component ref={ref} {...reconciledProps}>
        {children}
      </Component>
    );
  },
);

RendererElement.displayName = "RendererElement";
