/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import { useFrame } from "@react-three/fiber";
import {
  useXRInputSourceEvent,
  useXRInputSourceState,
  useXRStore,
} from "@react-three/xr";
import { useContext } from "react";
import { useSelectionStore } from "../selection-provider/store";
import { WebXRGetOriginContext } from "./context";

export function WebXRSelectionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const xrStore = useXRStore();
  const xrGetOrigin = useContext(WebXRGetOriginContext);
  const listeners = useSelectionStore((store) => store.listeners);
  const clearSelection = useSelectionStore((store) => store.clear);
  const controller = useXRInputSourceState("controller", "right");
  const selectElement = useSelectionStore((store) => store.select);
  const setHovered = useSelectionStore((store) => store.setHovered);

  if (!xrGetOrigin) {
    throw new Error("invariant: WebXRGetOriginContext was not found");
  }

  useXRInputSourceEvent(
    "all",
    "select",
    (e) => {
      const { originReferenceSpace } = xrStore.getState();
      if (!originReferenceSpace) {
        return;
      }

      const results = listeners.flatMap((listener) =>
        listener.cb({
          frame: e.frame,
          getOrigin: xrGetOrigin,
          inputSource: e.inputSource,
          originReferenceSpace,
        }),
      );

      if (results.length) {
        selectElement(results[0], "replace");
      } else {
        clearSelection();
      }
    },
    [],
  );

  useFrame((_, __, frame) => {
    if (!frame || !controller) {
      return;
    }

    const { originReferenceSpace } = xrStore.getState();
    if (!originReferenceSpace) {
      return;
    }

    const results = listeners.flatMap((listener) =>
      listener.cb({
        frame,
        getOrigin: xrGetOrigin,
        inputSource: controller.inputSource,
        originReferenceSpace,
      }),
    );

    setHovered(results.at(0) ?? null);
  });

  return children;
}
