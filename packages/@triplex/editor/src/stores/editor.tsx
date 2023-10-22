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
  exportName: string;
  path: string;
}

export interface FocusedObject {
  column: number;
  line: number;
  parentPath: string;
  path: string;
}

interface SelectionState {
  focus: (obj: FocusedObject | null) => void;
  focused: FocusedObject | null;
}

interface PersistPropValue {
  column: number;
  currentPropValue: unknown;
  line: number;
  nextPropValue: unknown;
  path: string;
  propName: string;
}

const useSelectionStore = create<SelectionState>((set) => ({
  focus: (sceneObject) => set({ focused: sceneObject }),
  focused: null,
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
      target,
      type,
    }: {
      target?: ComponentTarget;
      type: ComponentType;
    }) => {
      const componentPath = target ? target.path : path;
      const componentExportName = target ? target.exportName : exportName;

      const res = await fetch(
        "http://localhost:8000/scene/" +
          encodeURIComponent(componentPath) +
          `/${componentExportName}/object`,
        {
          body: JSON.stringify({
            target,
            type,
          }),
          method: "POST",
        }
      );

      const result = (await res.json()) as {
        column: number;
        line: number;
        path: string;
      };

      scene.focus({
        column: result.column,
        line: result.line,
        parentPath: componentPath,
        path: componentPath,
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
        column: target.column,
        line: target.line,
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
        column: target.column,
        line: target.line,
        parentPath: target.parentPath,
      });
    };

    performUndoableEvent({
      redo: redoAction,
      undo: undoAction,
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
        redo: redoAction,
        undo: undoAction,
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
        entered?: true;
        forceSaveAs?: true;
        replace?: true;
      } = {}
    ) => {
      if (
        componentParams.path === path &&
        componentParams.exportName === exportName &&
        metaParams.forceSaveAs === undefined &&
        metaParams.replace === undefined
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
        body: JSON.stringify({
          rename: path !== actualPath ? { [path]: actualPath } : {},
        }),
        method: "POST",
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
        encodedProps: "",
        exportName: data.exportName,
        path: data.path,
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
      encodedProps: "",
      exportName: data.exportName,
      path: data.path,
    });
  }, [path, set]);

  return useMemo(
    () => ({
      /**
       * Adds the component into the current file. Is not persisted until `save()` is
       * called.
       */
      addComponent,

      /**
       * Deletes the currently focused scene object. Able to be undone. Is not
       * persisted until `save()` is called.
       */
      deleteComponent,

      /**
       * Encoded (via `encodeURIComponent()`) props used to hydrate the loaded scene.
       */
      encodedProps,

      /**
       * Will be `true` when entered a component via a owning parent, else `false`.
       * Enter a component via `scene.navigateTo()`.
       *
       * @see {@link ./scene.tsx}
       */
      enteredComponent,

      /**
       * Exits the currently entered component and goes back to the parent.
       */
      exitComponent,

      /**
       * Returns the scene export name that is currently open.
       */
      exportName,

      /**
       * Focuses the passed scene object. Will blur the currently focused scene object
       * by passing `null`.
       *
       * You should probably be calling the scene API instead.
       *
       * @see {@link ./scene.tsx}
       */
      focus,

      /**
       * Creates a new intermediate component in the open file and transitions the
       * editor to it.
       */
      newComponent,

      /**
       * Creates a new intermediate file and transitions the editor to the file.
       */
      newFile,

      /**
       * Current value of the scene path.
       */
      path,

      /**
       * Persists the passed in prop value to the scene frame and web server, and
       * makes it available as an undo/redo action.
       */
      persistPropValue,

      /**
       * Resets the scene throwing away any unsaved state.
       */
      reset,

      /**
       * Calls the web server to save the intermediate scene source to file system.
       */
      save,

      /**
       * Sets the loaded scene to a specific path, export name, and props.
       */
      set,

      /**
       * Returns the currently focused scene object, else `null`.
       */
      target,
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
