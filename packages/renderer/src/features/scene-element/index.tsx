/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import {
  type RendererElementProps,
  type TriplexMeta,
} from "@triplex/bridge/client";
import {
  forwardRef,
  Fragment,
  Suspense,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { mergeRefs } from "use-callback-ref";
import { usePlayState } from "../../stores/use-play-state";
import { ActiveCameraContext } from "../camera-new/context";
import { hasThreeFiberHelper, ThreeFiberHelper } from "../three-fiber-helper";
import { buildElementKey } from "./build-element-key";
import {
  ParentComponentMetaContext,
  ParentComponentMetaProvider,
  SceneObjectContext,
} from "./context";
import { type SceneElementRef } from "./types";
import { useSceneObjectEvents } from "./use-scene-element-events";
import { useTemporaryProps } from "./use-temporary-props";

const disabledWhenTriplexCamera = [
  /^PresentationControls$/,
  /^ScrollControls$/,
  /^XROrigin$/,
];

const disabledWhenEditState = [/^XROrigin$/];

const passThroughWhenTriplexCamera = [/^Ecctrl$/, /Controls$/];

export const SceneElement = forwardRef<SceneElementRef, RendererElementProps>(
  (
    { __component: Component, __meta, forceInsideSceneObjectContext, ...props },
    ref,
  ) => {
    const { children, ...reconciledProps } = useTemporaryProps(__meta, props);
    const { onSceneObjectCommitted } = useSceneObjectEvents();
    const parentMeta = useContext(ParentComponentMetaContext);
    const type = typeof Component === "string" ? "host" : "custom";
    const hostRef = useRef(null);
    const insideSceneObjectContext = useContext(SceneObjectContext);
    const mergedRefs = useMemo(
      () => mergeRefs<SceneElementRef>([ref, hostRef]),
      [ref],
    );
    const propsRef = useRef(props);
    const camera = useContext(ActiveCameraContext);
    const playState = usePlayState();
    const triplexMeta: TriplexMeta = useMemo(
      () => ({
        ...__meta,
        parents: parentMeta,
        props: propsRef,
      }),
      [__meta, parentMeta],
    );

    useEffect(() => {
      onSceneObjectCommitted(__meta.path, __meta.line, __meta.column);
    }, [__meta.column, __meta.line, __meta.path, onSceneObjectCommitted]);

    useLayoutEffect(() => {
      propsRef.current = reconciledProps;
    }, [reconciledProps]);

    useEffect(() => {
      if (type === "custom" || !mergedRefs.current) {
        return;
      }

      mergedRefs.current.__triplex = triplexMeta;
    }, [mergedRefs, triplexMeta, type]);

    if (
      camera?.type === "editor" &&
      !disabledWhenTriplexCamera.some((r) => r.test(__meta.name)) &&
      passThroughWhenTriplexCamera.some((r) => r.test(__meta.name))
    ) {
      // We don't want this component to affect Triplex when looking through the camera.
      // E.g. user land controls. Get rid of the problem altogether!
      return <>{props.children as ReactNode}</>;
    } else if (forceInsideSceneObjectContext || insideSceneObjectContext) {
      // For specific controls components that we know can be disabled we disable them via
      // props when the editor scene is viewing through the triplex camera.
      const shouldDisableWhenThroughEditorCamera =
        type === "custom" &&
        camera?.type === "editor" &&
        disabledWhenTriplexCamera.some((r) => r.test(__meta.name));
      const shouldDisableWhenEditState =
        type === "custom" &&
        playState === "edit" &&
        disabledWhenEditState.some((r) => r.test(__meta.name));
      const shouldDisable =
        shouldDisableWhenThroughEditorCamera || shouldDisableWhenEditState;

      const key = buildElementKey(Component, props);
      const threeFiberHelper = hasThreeFiberHelper(triplexMeta);

      return (
        <ParentComponentMetaProvider type={type} value={triplexMeta}>
          <Component
            key={key}
            {...(Component === Fragment
              ? {}
              : { ref: type === "host" ? mergedRefs : ref })}
            {...reconciledProps}
            {...(shouldDisable
              ? { disabled: true, enabled: false }
              : undefined)}
          >
            {threeFiberHelper ? (
              <>
                <Suspense>
                  <ThreeFiberHelper helper={threeFiberHelper}>
                    <primitive attach="__triplex" object={triplexMeta} />
                  </ThreeFiberHelper>
                </Suspense>
                {children}
              </>
            ) : (
              children
            )}
          </Component>
        </ParentComponentMetaProvider>
      );
    }

    return (
      <Component {...(Component === Fragment ? {} : { ref })} {...props}>
        {children}
      </Component>
    );
  },
);

SceneElement.displayName = "SceneElement";
