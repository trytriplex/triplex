/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import {
  compose,
  on,
  type RendererElementProps,
  type TriplexMeta,
} from "@triplex/bridge/client";
import {
  createContext,
  forwardRef,
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { type Object3D } from "three";
import { mergeRefs } from "use-callback-ref";
import { useCamera } from "./components/camera";
import { getHelperForElement, Helper } from "./components/helper";
import { useSelectSceneObject } from "./selection";
import { useOnSceneObjectMount } from "./stores/selection";

const permanentlyExcluded = [/^Canvas$/];
const excludedWhenTriplexCamera = [/^Ecctrl$/, /Controls$/];

function useForceRender() {
  const [, setState] = useState(false);
  return useCallback(() => setState((prev) => !prev), []);
}

function useSceneObjectProps(
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

const ParentComponentMetaContext = createContext<TriplexMeta[]>([]);

function ParentComponentMetaProvider({
  children,
  type,
  value,
}: {
  children: React.ReactNode;
  type: "host" | "custom";
  value: TriplexMeta;
}) {
  const parents = useContext(ParentComponentMetaContext);
  // We keep a list of all parents at each level because not all nodes
  // are injected into the Three.js scene. Meaning if we just used a single
  // parent we'd lose data.
  const values = useMemo(() => [value, ...parents], [parents, value]);

  if (type === "host") {
    // We only store parent data of custom components.
    return <Fragment>{children}</Fragment>;
  }

  return (
    <ParentComponentMetaContext.Provider value={values}>
      {children}
    </ParentComponentMetaContext.Provider>
  );
}

export const SceneObjectContext = createContext(false);

export const SceneObject = forwardRef<unknown, RendererElementProps>(
  ({ __component: Component, __meta, ...props }, ref) => {
    const { children, ...reconciledProps } = useSceneObjectProps(__meta, props);
    const [isDeleted, setIsDeleted] = useState(false);
    const onSceneObjectMount = useOnSceneObjectMount();
    const parentMeta = useContext(ParentComponentMetaContext);
    const type = typeof Component === "string" ? "host" : "custom";
    const hostRef = useRef<Object3D>(null);
    const selectSceneObject = useSelectSceneObject();
    const insideSceneObjectContext = useContext(SceneObjectContext);
    const mergedRefs = useMemo(() => mergeRefs([ref, hostRef]), [ref]);
    const { isTriplexCamera } = useCamera();

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
    } else if (permanentlyExcluded.some((r) => r.test(__meta.name))) {
      // We don't want this component to render to the scene and affect Triplex.
      // Noop it out and render its children.
      return <>{props.children}</>;
    } else if (
      isTriplexCamera &&
      excludedWhenTriplexCamera.some((r) => r.test(__meta.name))
    ) {
      // We don't want this component to affect Triplex when looking through the camera.
      // E.g. user land controls. Get rid of the problem altogether!
      return <>{props.children}</>;
    } else if (insideSceneObjectContext) {
      const helper =
        typeof Component === "string"
          ? getHelperForElement(Component)
          : undefined;
      const triplexMeta: TriplexMeta = {
        ...__meta,
        parents: parentMeta,
        props,
      };

      return (
        <ParentComponentMetaProvider type={type} value={triplexMeta}>
          <Component
            ref={type === "host" ? mergedRefs : ref}
            {...reconciledProps}
          >
            {type === "custom" ? (
              // This keeps any preconditions for custom components valid
              // e.g. they always take the same amount of children, no mutations.
              // React.Children.only() use case.
              children
            ) : (
              // For host elements we inject extra metadata for lookups but otherwise
              // keep things pretty much the same (no Three.js scene mutation).
              <>
                {children}
                <primitive attach="__triplex" object={triplexMeta} />
              </>
            )}
          </Component>

          {helper && (
            <Helper
              args={helper[1]}
              helperName={helper[0]}
              onClick={(e) => {
                if (e.delta > 1 || !hostRef.current) {
                  return;
                }

                e.stopPropagation();
                selectSceneObject(hostRef.current);
              }}
              targetRef={hostRef}
            />
          )}
        </ParentComponentMetaProvider>
      );
    }

    return (
      <Component ref={ref} {...props}>
        {children}
      </Component>
    );
  },
);

SceneObject.displayName = "SceneObject";
