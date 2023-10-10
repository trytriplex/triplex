/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { send } from "@triplex/bridge/host";
import type { ComponentTarget, ComponentType } from "@triplex/server";
import { create } from "zustand";

export interface FocusedObject {
  column: number;
  line: number;
  parentPath: string;
  path: string;
}

interface BridgeContext {
  /**
   * Adds a component to the scene until any HMR event is fired whereby all
   * added components are removed.
   */
  addComponent(data: { target?: ComponentTarget; type: ComponentType }): void;
  /**
   * Removes focus from the currently selected scene object.
   */
  blur(): void;
  /**
   * Deletes a component from the scene. Will try to persist state if possible.
   */
  deleteComponent(component: {
    column: number;
    line: number;
    parentPath: string;
  }): void;
  /**
   * Focuses the passed in scene object. This will open the context panel and
   * enable some editor capabilities for the selected scene object.
   */
  focus(sceneObject: FocusedObject): void;
  /**
   * Returns the persisted prop value. It should not return the current
   * intermediate value.
   */
  getPropValue(prop: {
    column: number;
    line: number;
    path: string;
    propName: string;
  }): Promise<{ value: unknown }>;
  /**
   * Jumps the scene camera to the currently focused scene object.
   */
  jumpTo(): void;
  /**
   * Navigate the scene to the scene object.
   *
   * @param sceneObject Navigates to the passed in scene object. When undefined
   *   navigates to the currently focused scene object.
   */
  navigateTo(sceneObject?: {
    encodedProps: string;
    exportName: string;
    path: string;
  }): void;
  /**
   * Persists the value of a prop which tells the editor that this is now the
   * current value of the prop. This should only be called after a change has
   * been "completed", for example during a mouse up event or blur event.
   */
  persistPropValue(prop: {
    column: number;
    line: number;
    path: string;
    propName: string;
    propValue: unknown;
  }): void;
  /**
   * Value is `true` when the scene is ready else `false`. If the scene is not
   * ready accessing any of the scene store values will throw an invariant.
   */
  ready: boolean;
  /**
   * Refreshes the scene.
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
   * Resets the triplex camera back to the editor default.
   */
  resetCamera(): void;
  /**
   * Restores a component that was previously deleted from the scene.
   */
  restoreComponent(component: {
    column: number;
    line: number;
    parentPath: string;
  }): void;
  /**
   * Sets the scene camera type.
   */
  setCameraType(type: "perspective" | "orthographic"): void;
  /**
   * Sets the value of a prop in the scene frame. This can be set as frequently
   * as needed as is considered the intermediate values during a change. When
   * setting a prop value it is not yet considered "persisted".
   */
  setPropValue(prop: {
    column: number;
    line: number;
    path: string;
    propName: string;
    propValue: unknown;
  }): void;
  /**
   * Sets the scene transform control mode.
   */
  setTransform(mode: "scale" | "translate" | "rotate"): void;
  /**
   * Switches the triplex camera to the currently focused camera. If the focused
   * scene object is not a camera is noops.
   */
  viewFocusedCamera(): void;
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
    addComponent(data) {
      send("trplx:requestAddNewComponent", data);
    },
    blur() {
      send("trplx:requestBlurSceneObject", undefined);
    },
    deleteComponent(data) {
      send("trplx:requestDeleteSceneObject", data);
    },
    focus(sceneObject) {
      send("trplx:requestFocusSceneObject", sceneObject);
    },
    getPropValue(prop) {
      return send("trplx:requestSceneObjectPropValue", prop, true);
    },
    jumpTo() {
      send("trplx:requestJumpToSceneObject", undefined);
    },
    navigateTo(sceneObject) {
      send("trplx:requestNavigateToScene", sceneObject);
    },
    persistPropValue(data) {
      send("trplx:requestPersistSceneObjectProp", data);
    },
    ready: false,
    refresh({ hard }: { hard?: boolean } = {}) {
      send("trplx:requestRefresh", { hard });
    },
    reset() {
      send("trplx:requestReset", undefined);
    },
    resetCamera() {
      send("trplx:requestAction", { action: "resetCamera" });
    },
    restoreComponent(data) {
      send("trplx:requestRestoreSceneObject", data);
    },
    sceneReady() {
      setStore({ ready: true });
    },
    setCameraType(type) {
      send("trplx:requestCameraTypeChange", { type });
    },
    setPropValue(data) {
      send("trplx:requestSetSceneObjectProp", data);
    },
    setTransform(mode) {
      send("trplx:requestTransformChange", { mode });
    },
    viewFocusedCamera() {
      send("trplx:requestAction", { action: "viewFocusedCamera" });
    },
  })
);
