import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { compose, listen } from "@triplex/bridge/client";

function useRender() {
  const [, setState] = useState(false);
  return useCallback(() => setState((prev) => !prev), []);
}

function isRenderedSceneObject(name: string): boolean {
  const exclusions = ["Material", "Geometry"];
  if (exclusions.find((n) => name.includes(n))) {
    return false;
  }

  return true;
}

function useSceneObjectProps(
  meta: SceneObjectProps["__meta"],
  props: Record<string, unknown>
): Record<string, unknown> {
  const forceRender = useRender();
  const ref = useRef<Record<string, unknown>>({});

  if (import.meta.hot) {
    import.meta.hot.on("vite:afterUpdate", (e) => {
      const isUpdated = e.updates.find((up) => meta.path.endsWith(up.path));
      if (isUpdated) {
        // On HMR clear out the intermediate state so when it's rendered again
        // It'll use the latest values from source.
        ref.current = {};
      }
    });
  }

  useEffect(() => {
    return compose([
      listen("trplx:requestSetSceneObjectProp", (data) => {
        if (
          data.column === meta.column &&
          data.line === meta.line &&
          data.path === meta.path
        ) {
          ref.current[data.propName] = data.propValue;
          forceRender();
        }
      }),
      listen("trplx:requestResetSceneObjectProp", (data) => {
        if (
          data.column === meta.column &&
          data.line === meta.line &&
          data.path === meta.path
        ) {
          delete ref.current[data.propName];
          forceRender();
        }
      }),
    ]);
  }, [meta.column, meta.line, meta.name, meta.path, forceRender]);

  return { ...props, ...ref.current };
}

interface SceneObjectProps {
  __component: React.ForwardRefExoticComponent<{ ref: unknown }>;
  __meta: { line: number; column: number; path: string; name: string };
}

export const SceneObject = forwardRef<unknown, SceneObjectProps>(
  ({ __component: Component, __meta, ...props }, ref) => {
    const reconciledProps = useSceneObjectProps(__meta, props);

    if (isRenderedSceneObject(__meta.name)) {
      return (
        <group userData={{ triplexSceneMeta: { ...__meta, props } }}>
          <Component ref={ref} {...reconciledProps} />
        </group>
      );
    } else {
      return <Component ref={ref} {...reconciledProps} />;
    }
  }
);
