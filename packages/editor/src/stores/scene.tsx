import { send } from "@triplex/bridge/host";
import { create } from "zustand";
import { ComponentTarget, ComponentType } from "../api-types";

export interface FocusedObject {
  line: number;
  column: number;
  ownerPath: string;
}

interface BridgeContext {
  /**
   * Adds a component to the scene until any HMR event is fired whereby all
   * added components are removed.
   */
  addComponent(data: { type: ComponentType; target?: ComponentTarget }): void;
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
   * Removes focus from the currently selected scene object.
   */
  blur(): void;
  /**
   * Focuses the passed in scene object. This will open the context panel and
   * enable some editor capabilities for the selected scene object.
   */
  focus(sceneObject: FocusedObject): void;
  /**
   * Jumps the scene camera to the currently focused scene object.
   */
  jumpTo(): void;
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
   * Navigate the scene to the scene object.
   *
   * @param sceneObject Navigates to the passed in scene object. When undefined
   *   navigates to the currently focused scene object.
   */
  navigateTo(sceneObject?: {
    path: string;
    encodedProps: string;
    exportName: string;
  }): void;
  /**
   * Sets the scene transform control mode.
   */
  setTransform(mode: "scale" | "translate" | "rotate"): void;
  /**
   * Deletes a component from the scene. Will try to persist state if possible.
   */
  deleteComponent(component: {
    column: number;
    line: number;
    path: string;
  }): void;
  /**
   * Restores a component that was previously deleted from the scene.
   */
  restoreComponent(component: {
    column: number;
    line: number;
    path: string;
  }): void;
  /**
   * Value is `true` when the scene is ready else `false`. If the scene is not
   * ready accessing any of the scene store values will throw an invariant.
   */
  ready: boolean;
  /**
   * Clears out the scene of any intermediate state. Generally you'll want to
   * use the editor store instead of this one directly.
   *
   * @see {@link ./editor.tsx}
   */
  reset(): void;
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
    ready: false,
    sceneReady() {
      setStore({ ready: true });
    },
    addComponent(data) {
      send("trplx:requestAddNewComponent", data);
    },
    getPropValue(prop) {
      return send("trplx:requestSceneObjectPropValue", prop, true);
    },
    blur() {
      send("trplx:requestBlurSceneObject", undefined);
    },
    focus(sceneObject) {
      send("trplx:requestFocusSceneObject", sceneObject);
    },
    jumpTo() {
      send("trplx:requestJumpToSceneObject", undefined);
    },
    navigateTo(sceneObject) {
      send("trplx:requestNavigateToScene", sceneObject);
    },
    setPropValue(data) {
      send("trplx:requestSetSceneObjectProp", data);
    },
    persistPropValue(data) {
      send("trplx:requestPersistSceneObjectProp", data);
    },
    setTransform(mode) {
      send("trplx:requestTransformChange", { mode });
    },
    deleteComponent(data) {
      send("trplx:requestDeleteSceneObject", data);
    },
    restoreComponent(data) {
      send("trplx:requestRestoreSceneObject", data);
    },
    reset() {
      send("trplx:requestReset", undefined);
    },
  })
);
