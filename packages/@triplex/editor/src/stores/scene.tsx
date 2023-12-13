/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { send } from "@triplex/bridge/host";
import { create } from "zustand";

export interface FocusedObject {
  column: number;
  line: number;
  parentPath: string;
  path: string;
}

interface BridgeContext {
  /**
   * Removes focus from the currently selected scene object.
   */
  blur(): void;
  /**
   * Optimistically delete a component from the scene before it has been deleted
   * in source.
   */
  deleteComponent(component: {
    column: number;
    line: number;
    parentPath: string;
  }): void;
  /**
   * Focus a scene object.
   */
  focus(sceneObject: FocusedObject): void;
  /**
   * Jumps the viewport to the focused scene object, if any.
   */
  jumpTo(sceneObject?: { column: number; line: number; path: string }): void;
  /**
   * Navigate to a new component.
   */
  navigateTo(sceneObject?: {
    encodedProps: string;
    exportName: string;
    path: string;
  }): void;
  /**
   * Value is `true` when the scene is ready else `false`. If the scene is not
   * ready accessing any of the scene store values will throw an invariant.
   */
  ready: boolean;
  /**
   * Refresh the scene. By default should re-mount the scene, pass in `hard` to
   * completely reload it.
   */
  refresh(opts?: { hard?: boolean }): void;
  /**
   * Clears out the scene of any intermediate state. Generally you'll want to
   * use the editor store instead of this one directly.
   *
   * @see {@link ./editor.tsx}
   */
  reset(): void;
  /**
   * Sets the temporary value of a prop.
   *
   * This can be set as frequently as needed as it's intermediate state and not
   * yet persisted to source code.
   */
  setPropValue(prop: {
    column: number;
    line: number;
    path: string;
    propName: string;
    propValue: unknown;
  }): void;
}

/**
 * **useScene()**
 *
 * Allows you to imperatively control the scene opened by the editor. Generally
 * you'll want to use the editor store instead of this one.
 *
 * @see {@link ./editor.tsx}
 */
export const useScene = create<BridgeContext & { sceneReady: () => void }>(
  (setStore) => ({
    blur() {
      send("request-blur-element", undefined);
    },
    deleteComponent(data) {
      send("request-delete-element", data);
    },
    focus(sceneObject) {
      send("request-focus-element", sceneObject);
    },
    jumpTo(sceneObject) {
      send("request-jump-to-element", sceneObject);
    },
    navigateTo(sceneObject) {
      send("request-open-component", sceneObject);
    },
    ready: false,
    refresh({ hard }: { hard?: boolean } = {}) {
      send("request-refresh-scene", { hard });
    },
    reset() {
      send("request-reset-scene", undefined);
    },
    sceneReady() {
      setStore({ ready: true });
    },
    setPropValue(data) {
      send("request-set-element-prop", data);
    },
  })
);
