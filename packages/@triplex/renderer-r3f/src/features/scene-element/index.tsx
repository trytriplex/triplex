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
  forwardRef,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { type Object3D } from "three";
import { mergeRefs } from "use-callback-ref";
import { useCamera } from "../camera/context";
import { hasHelper, Helper } from "../scene-element-helper";
import { buildElementKey } from "./build-element-key";
import {
  ParentComponentMetaContext,
  ParentComponentMetaProvider,
  SceneObjectContext,
} from "./context";
import { useSceneObjectEvents } from "./use-scene-element-events";
import { useTemporaryProps } from "./use-temporary-props";

const disabledWhenTriplexCamera = [
  /^PresentationControls$/,
  /^ScrollControls$/,
];
const passThroughWhenTriplexCamera = [/^Ecctrl$/, /Controls$/];

export const SceneElement = forwardRef<unknown, RendererElementProps>(
  (
    { __component: Component, __meta, forceInsideSceneObjectContext, ...props },
    ref,
  ) => {
    const { children, ...reconciledProps } = useTemporaryProps(__meta, props);
    const [isDeleted, setIsDeleted] = useState(false);
    const { onSceneObjectCommitted } = useSceneObjectEvents();
    const parentMeta = useContext(ParentComponentMetaContext);
    const type = typeof Component === "string" ? "host" : "custom";
    const hostRef = useRef<Object3D>(null);
    const insideSceneObjectContext = useContext(SceneObjectContext);
    // eslint-disable-next-line react-compiler/react-compiler
    const mergedRefs = useMemo(() => mergeRefs([ref, hostRef]), [ref]);
    const { isTriplexCamera } = useCamera();

    useEffect(() => {
      return compose([
        on("request-delete-element", (data) => {
          if (
            data.column === __meta.column &&
            data.line === __meta.line &&
            data.path === __meta.path
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
      onSceneObjectCommitted(__meta.path, __meta.line, __meta.column);
    }, [__meta.column, __meta.line, __meta.path, onSceneObjectCommitted]);

    if (isDeleted) {
      // This component will eventually unmount when deleted as its removed
      // from source code. To keep things snappy however we delete it optimistically.
      return null;
    } else if (
      isTriplexCamera &&
      !disabledWhenTriplexCamera.some((r) => r.test(__meta.name)) &&
      passThroughWhenTriplexCamera.some((r) => r.test(__meta.name))
    ) {
      // We don't want this component to affect Triplex when looking through the camera.
      // E.g. user land controls. Get rid of the problem altogether!
      return <>{props.children}</>;
    } else if (forceInsideSceneObjectContext || insideSceneObjectContext) {
      const triplexMeta: TriplexMeta = {
        ...__meta,
        parents: parentMeta,
        props,
      };
      // For specific controls components that we know can be disabled we disable them via
      // props when the editor scene is viewing through the triplex camera.
      const shouldDisable =
        type === "custom" &&
        isTriplexCamera &&
        disabledWhenTriplexCamera.some((r) => r.test(__meta.name));
      const key = buildElementKey(Component, props);

      return (
        <ParentComponentMetaProvider type={type} value={triplexMeta}>
          <Component
            key={key}
            ref={type === "host" ? mergedRefs : ref}
            {...reconciledProps}
            {...(shouldDisable ? { enabled: false } : undefined)}
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
                {hasHelper(Component) && (
                  <Helper>
                    <primitive attach="__triplex" object={triplexMeta} />
                  </Helper>
                )}
              </>
            )}
          </Component>
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

SceneElement.displayName = "SceneElement";
