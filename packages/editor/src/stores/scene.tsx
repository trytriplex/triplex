import { create } from "zustand";

export interface FocusedObject {
  line: number;
  column: number;
  ownerPath: string;
}

interface BridgeContext {
  /**
   * Returns the persisted prop value.
   * It should not return the current intermediate value.
   */
  getPropValue(_: {
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
   * Focuses the passed in scene object. This will open the context
   * panel and enable some editor capabilities for the selected scene
   * object.
   */
  focus(sceneObject: FocusedObject): void;
  /**
   * Jumps the scene camera to the currently focused scene object.
   */
  jumpTo(): void;
  /**
   * Sets the value of a prop in the scene frame.
   * This can be set as frequently as needed as is
   * considered the intermediate values during a change.
   * When setting a prop value it is not yet considered "persisted".
   */
  setPropValue(_: {
    column: number;
    line: number;
    path: string;
    propName: string;
    propValue: unknown;
  }): void;
  /**
   * Persists the value of a prop which tells the editor that
   * this is now the current value of the prop. This should only
   * be called after a change has been "completed", for example
   * during a mouse up event or blur event.
   */
  persistPropValue(_: {
    column: number;
    line: number;
    path: string;
    propName: string;
    propValue: unknown;
  }): void;
  /**
   * Navigates the scene frame to the new scene object.
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
   * Value is `true` when the scene is ready else `false`.
   * If the scene is not ready accessing any of the scene store
   * values will throw an invariant.
   */
  ready: boolean;
}

export const useScene = create<
  BridgeContext & { __set: (ctx: Omit<BridgeContext, "ready">) => void }
>((setStore) => ({
  ready: false,
  __set(ctx) {
    setStore({ ...ctx, ready: true });
  },
  getPropValue() {
    throw new Error("invariant");
  },
  blur() {
    throw new Error("invariant");
  },
  focus() {
    throw new Error("invariant");
  },
  jumpTo() {
    throw new Error("invariant");
  },
  navigateTo() {
    throw new Error("invariant");
  },
  setPropValue() {
    throw new Error("invariant");
  },
  persistPropValue() {
    throw new Error("invariant");
  },
  setTransform() {
    throw new Error("invariant");
  },
}));
