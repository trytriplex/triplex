/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import type { ComponentTarget, ComponentType } from "@triplex/server";
import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { create } from "zustand";
import { showSaveDialog } from "../util/prompt";
import { stringifyJSON } from "../util/string";
import { useScene } from "./scene";
import { useUndoRedoState } from "./undo-redo";

export interface Params {
  encodedProps: string;
  path: string;
  exportName: string;
}

export interface FocusedObject {
  line: number;
  column: number;
  path: string;
  parentPath: string;
}

interface SelectionState {
  focus: (obj: FocusedObject | null) => void;
  focused: FocusedObject | null;
}

interface PersistPropValue {
  column: number;
  line: number;
  path: string;
  propName: string;
  currentPropValue: unknown;
  nextPropValue: unknown;
}

const useSelectionStore = create<SelectionState>((set) => ({
  focused: null,
  focus: (sceneObject) => set({ focused: sceneObject }),
}));

/**
 * **useEditor()**
 *
 * Exposes controls for the editor, calls out to the scene store when needing to
 * mutate the currently open scene.
 *
 * @see {@link ./scene.tsx}
 */
export function useEditor() {
  const [searchParams, setSearchParams] = useSearchParams({ path: "" });
  const path = searchParams.get("path") || "";
  const encodedProps = searchParams.get("props") || "";
  const exportName = searchParams.get("exportName") || "";
  const enteredComponent = !!searchParams.get("entered") || false;
  const focus = useSelectionStore((store) => store.focus);
  const target = useSelectionStore((store) => store.focused);
  const scene = useScene();
  const performUndoableEvent = useUndoRedoState(
    (store) => store.performUndoableEvent
  );
  const clearUndoRedo = useUndoRedoState((store) => store.clearUndoRedo);

  const addComponent = useCallback(
    async ({
      type,
      target,
    }: {
      type: ComponentType;
      target?: ComponentTarget;
    }) => {
      const componentPath = target ? target.path : path;
      const componentExportName = target ? target.exportName : exportName;

      const res = await fetch(
        "http://localhost:8000/scene/" +
          encodeURIComponent(componentPath) +
          `/${componentExportName}/object`,
        {
          method: "POST",
          body: JSON.stringify({
            target,
            type,
          }),
        }
      );

      const result = (await res.json()) as {
        line: number;
        column: number;
        path: string;
      };

      scene.focus({
        column: result.column,
        line: result.line,
        path: componentPath,
        parentPath: componentPath,
      });

      return result;
    },
    [path, exportName, scene]
  );

  const deleteComponent = useCallback(() => {
    if (!target) {
      return;
    }

    const undoAction = () => {
      fetch(
        `http://localhost:8000/scene/${encodeURIComponent(path)}/object/${
          target.line
        }/${target.column}/restore`,
        { method: "POST" }
      );
      scene.restoreComponent({
        line: target.line,
        column: target.column,
        parentPath: target.parentPath,
      });
    };

    const redoAction = () => {
      fetch(
        `http://localhost:8000/scene/${encodeURIComponent(path)}/object/${
          target.line
        }/${target.column}/delete`,
        { method: "POST" }
      );
      scene.deleteComponent({
        line: target.line,
        column: target.column,
        parentPath: target.parentPath,
      });
    };

    performUndoableEvent({
      undo: undoAction,
      redo: redoAction,
    });

    scene.blur();
  }, [path, performUndoableEvent, scene, target]);

  const exitComponent = useCallback(() => {
    window.history.back();
  }, []);

  const persistPropValue = useCallback(
    (data: PersistPropValue) => {
      const undoAction = () => {
        const propData = {
          column: data.column,
          line: data.line,
          path: data.path,
          propName: data.propName,
          propValue: data.currentPropValue,
        };

        scene.setPropValue(propData);
        scene.persistPropValue(propData);

        fetch(
          `http://localhost:8000/scene/object/${data.line}/${
            data.column
          }/prop?value=${encodeURIComponent(
            stringifyJSON(data.currentPropValue)
          )}&path=${encodeURIComponent(data.path)}&name=${encodeURIComponent(
            data.propName
          )}`
        );
      };

      const redoAction = () => {
        const propData = {
          column: data.column,
          line: data.line,
          path: data.path,
          propName: data.propName,
          propValue: data.nextPropValue,
        };

        scene.setPropValue(propData);
        scene.persistPropValue(propData);

        fetch(
          `http://localhost:8000/scene/object/${data.line}/${
            data.column
          }/prop?value=${encodeURIComponent(
            stringifyJSON(data.nextPropValue)
          )}&path=${encodeURIComponent(data.path)}&name=${encodeURIComponent(
            data.propName
          )}`
        );
      };

      performUndoableEvent({
        undo: undoAction,
        redo: redoAction,
      });
    },
    [performUndoableEvent, scene]
  );

  const reset = useCallback(() => {
    clearUndoRedo();

    scene.blur();
    scene.reset();

    fetch(`http://localhost:8000/scene/${encodeURIComponent(path)}/reset`);
  }, [clearUndoRedo, path, scene]);

  if (path && !exportName) {
    throw new Error("invariant: exportName is undefined");
  }

  const set = useCallback(
    (
      componentParams: Params,
      metaParams: {
        replace?: true;
        entered?: true;
        forceSaveAs?: true;
      } = {}
    ) => {
      if (
        componentParams.path === path &&
        componentParams.exportName === exportName &&
        typeof metaParams.forceSaveAs === "undefined" &&
        typeof metaParams.replace === "undefined"
      ) {
        // Bail if we're already on the same path.
        // If we implement props being able to change
        // We'll need to do more work here later.
        return;
      }

      const newParams: Record<string, string> = {};

      if (componentParams.path) {
        newParams.path = componentParams.path;
      }

      if (componentParams.encodedProps) {
        newParams.props = componentParams.encodedProps;
      }

      if (componentParams.exportName) {
        newParams.exportName = componentParams.exportName;
      }

      if (metaParams.entered) {
        newParams.entered = "true";
      }

      if (metaParams.forceSaveAs) {
        newParams.forceSaveAs = "true";
      }

      setSearchParams(newParams, { replace: metaParams.replace });
    },
    [exportName, path, setSearchParams]
  );

  const save = useCallback(
    async (saveAs = !!searchParams.get("forceSaveAs")) => {
      let actualPath = path;

      if (saveAs) {
        const enteredPath = await showSaveDialog(path);
        if (!enteredPath) {
          // Abort, user cleared filename or cancelled.
          return;
        } else {
          actualPath = enteredPath;
        }
      }

      // Clear the update stack as the line and column numbers of jsx elements
      // Will most likely change after formatting resulting in the rpc calls not
      // Working anymore.
      clearUndoRedo();

      await fetch("http://localhost:8000/project/save", {
        method: "POST",
        body: JSON.stringify({
          rename: path !== actualPath ? { [path]: actualPath } : {},
        }),
      });

      if (actualPath !== path) {
        // The path has changed so we need to update the URL to reflect that.
        set(
          {
            encodedProps,
            exportName,
            path: actualPath,
          },
          { replace: true }
        );
      }
    },
    [clearUndoRedo, encodedProps, exportName, path, searchParams, set]
  );

  const newFile = useCallback(async () => {
    const result = await fetch(`http://localhost:8000/scene/new`, {
      method: "POST",
    });
    const data = await result.json();

    set(
      {
        exportName: data.exportName,
        path: data.path,
        encodedProps: "",
      },
      { forceSaveAs: true }
    );
  }, [set]);

  const newComponent = useCallback(async () => {
    const result = await fetch(
      `http://localhost:8000/scene/${encodeURIComponent(path)}/new`,
      { method: "POST" }
    );
    const data = await result.json();

    set({
      exportName: data.exportName,
      path: data.path,
      encodedProps: "",
    });
  }, [path, set]);

  return useMemo(
    () => ({
      /**
       * Creates a new intermediate file and transitions the editor to the file.
       */
      newFile,
      /**
       * Creates a new intermediate component in the open file and transitions
       * the editor to it.
       */
      newComponent,
      /**
       * Adds the component into the current file. Is not persisted until
       * `save()` is called.
       */
      addComponent,
      /**
       * Will be `true` when entered a component via a owning parent, else
       * `false`. Enter a component via `scene.navigateTo()`.
       *
       * @see {@link ./scene.tsx}
       */
      enteredComponent,
      /**
       * Exits the currently entered component and goes back to the parent.
       */
      exitComponent,
      /**
       * Deletes the currently focused scene object. Able to be undone. Is not
       * persisted until `save()` is called.
       */
      deleteComponent,
      /**
       * Current value of the scene path.
       */
      path,
      /**
       * Encoded (via `encodeURIComponent()`) props used to hydrate the loaded
       * scene.
       */
      encodedProps,
      /**
       * Sets the loaded scene to a specific path, export name, and props.
       */
      set,
      /**
       * Focuses the passed scene object. Will blur the currently focused scene
       * object by passing `null`.
       *
       * You should probably be calling the scene API instead.
       *
       * @see {@link ./scene.tsx}
       */
      focus,
      /**
       * Returns the currently focused scene object, else `null`.
       */
      target,
      /**
       * Returns the scene export name that is currently open.
       */
      exportName,
      /**
       * Calls the web server to save the intermediate scene source to file
       * system.
       */
      save,
      /**
       * Persists the passed in prop value to the scene frame and web server,
       * and makes it available as an undo/redo action.
       */
      persistPropValue,
      /**
       * Resets the scene throwing away any unsaved state.
       */
      reset,
    }),
    [
      addComponent,
      deleteComponent,
      encodedProps,
      enteredComponent,
      exitComponent,
      exportName,
      focus,
      newComponent,
      newFile,
      path,
      persistPropValue,
      reset,
      save,
      set,
      target,
    ]
  );
}
