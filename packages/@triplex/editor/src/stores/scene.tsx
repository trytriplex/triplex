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
   * Switches the editor camera to either the passed in reference or the
   * currently focused camera.
   */
  enterCamera(sceneObject?: {
    column: number;
    line: number;
    path: string;
  }): void;
  /**
   * Focus a scene object.
   */
  focus(sceneObject: FocusedObject): void;
  /**
   * Returns the current value for the prop. It should not return the current
   * intermediate value.
   */
  getPropValue(prop: {
    column: number;
    line: number;
    path: string;
    propName: string;
  }): Promise<{ value: unknown }>;
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
   * Persist the value of a prop back to source code.
   *
   * This should only be called after a change has been "completed", for example
   * during a mouse up event or blur event.
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
   * Resets the viewport back to default.
   */
  resetCamera(): void;
  /**
   * Sets the scene camera type.
   */
  setCameraType(type: "perspective" | "orthographic"): void;
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
  /**
   * Sets the scene transform control mode.
   */
  setTransform(mode: "scale" | "translate" | "rotate"): void;
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
      send("trplx:requestBlurSceneObject", undefined);
    },
    deleteComponent(data) {
      send("trplx:requestDeleteSceneObject", data);
    },
    enterCamera(sceneObject) {
      send("trplx:requestAction", { action: "enterCamera", data: sceneObject });
    },
    focus(sceneObject) {
      send("trplx:requestFocusSceneObject", sceneObject);
    },
    getPropValue(prop) {
      return send("trplx:requestSceneObjectPropValue", prop, true);
    },
    jumpTo(sceneObject) {
      send("trplx:requestJumpToSceneObject", sceneObject);
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
  })
);
