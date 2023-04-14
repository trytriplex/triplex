import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { compose, listen } from "@triplex/bridge/client";

function useForceRender() {
  const [, setState] = useState(false);
  return useCallback(() => setState((prev) => !prev), []);
}

function isRenderedSceneObject(name: string): boolean {
  const exclusions = ["Material", "Geometry", "Attribute"];
  if (exclusions.find((n) => name.includes(n))) {
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
      const isUpdated = e.updates.find((up) => meta.path.endsWith(up.path));
      if (isUpdated) {
        // On HMR clear out the intermediate state so when it's rendered again
        // It'll use the latest values from source.
        intermediateProps.current = {};
      }
    });
  }, [meta.path]);

  useEffect(() => {
    return compose([
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
    if (typeof value === "undefined") {
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

export interface SceneObjectProps {
  __component: React.ForwardRefExoticComponent<{ ref: unknown }> | string;
  __meta: {
    line: number;
    column: number;
    path: string;
    name: string;
    // These props are only set if the scene object is a host component
    // and has {position/scale/rotation} set statically (not through spread props).
    translate: boolean;
    scale: boolean;
    rotate: boolean;
  };
}

export const SceneObject = forwardRef<unknown, SceneObjectProps>(
  ({ __component: Component, __meta, ...props }, ref) => {
    const reconciledProps = useSceneObjectProps(__meta, props);
    const [isDeleted, setIsDeleted] = useState(false);

    useEffect(() => {
      return compose([
        listen("trplx:requestDeleteSceneObject", (data) => {
          if (
            data.column === __meta.column &&
            data.line === __meta.line &&
            data.path === __meta.path
          ) {
            setIsDeleted(true);
          }
        }),
        listen("trplx:requestRestoreSceneObject", (data) => {
          if (
            data.column === __meta.column &&
            data.line === __meta.line &&
            data.path === __meta.path
          ) {
            setIsDeleted(false);
          }
        }),
      ]);
    }, [__meta.column, __meta.line, __meta.path]);

    if (isRenderedSceneObject(__meta.name)) {
      return (
        <group
          userData={{ triplexSceneMeta: { ...__meta, props } }}
          visible={!isDeleted}
        >
          <Component ref={ref} {...reconciledProps} />
        </group>
      );
    } else if (!isDeleted) {
      return <Component ref={ref} {...reconciledProps} />;
    }

    return null;
  }
);
