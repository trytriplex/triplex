/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import type { ComponentTarget, ComponentType } from "@triplex/server";
import { startTransition, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { create } from "zustand";
import { stringifyJSON } from "../util/string";
import useEvent from "../util/use-event";
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

  const deleteComponent = useCallback(
    (element?: { column: number; line: number; parentPath: string }) => {
      const toDelete = element || target;
      if (!toDelete) {
        return;
      }

      const undoAction = () => {
        fetch(
          `http://localhost:8000/scene/${encodeURIComponent(
            toDelete.parentPath
          )}/object/${toDelete.line}/${toDelete.column}/restore`,
          { method: "POST" }
        );
      };

      const redoAction = () => {
        fetch(
          `http://localhost:8000/scene/${encodeURIComponent(
            toDelete.parentPath
          )}/object/${toDelete.line}/${toDelete.column}/delete`,
          { method: "POST" }
        );
        scene.deleteComponent({
          column: toDelete.column,
          line: toDelete.line,
          parentPath: toDelete.parentPath,
        });
      };

      performUndoableEvent({
        redo: redoAction,
        undo: undoAction,
      });

      scene.blur();
    },
    [performUndoableEvent, scene, target]
  );

  const exitComponent = useCallback(() => {
    window.history.back();
  }, []);

  const close = useEvent((filePath: string) => {
    fetch(`http://localhost:8000/scene/${encodeURIComponent(filePath)}/close`);
  });

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
        replace?: true;
        skipTransition?: boolean;
      } = {}
    ) => {
      if (
        componentParams.path === path &&
        componentParams.exportName === exportName &&
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

      if (metaParams.skipTransition) {
        // We want a loading state for a new file
        setSearchParams(newParams, { replace: metaParams.replace });
      } else {
        startTransition(() => {
          // Keeping this behind a transition ensures there isn't a flash of loading state.
          setSearchParams(newParams, { replace: metaParams.replace });
        });
      }
    },
    [exportName, path, setSearchParams]
  );

  const saveAs = useCallback(async () => {
    const newPath = await window.triplex.showSaveDialog(path);
    if (!newPath) {
      return;
    }

    await fetch(
      `http://localhost:8000/scene/${encodeURIComponent(
        path
      )}/save-as?newPath=${encodeURIComponent(newPath)}`,
      {
        method: "POST",
      }
    );

    if (newPath !== path) {
      // Path has changed, redirect!
      set(
        {
          encodedProps,
          exportName,
          path: newPath,
        },
        { skipTransition: true }
      );
    }

    // Clear the update stack as the line and column numbers of jsx elements
    // Will most likely change after formatting resulting in the rpc calls not
    // Working anymore.
    clearUndoRedo();
  }, [clearUndoRedo, encodedProps, exportName, path, set]);

  const save = useCallback(async () => {
    const response = await fetch(
      `http://localhost:8000/scene/${encodeURIComponent(path)}/save`,
      {
        method: "POST",
      }
    );
    const data = await response.json();

    if (data.message === "error" && data.error.id === "missing-new-path") {
      return saveAs();
    }

    // Clear the update stack as the line and column numbers of jsx elements
    // Will most likely change after formatting resulting in the rpc calls not
    // Working anymore.
    clearUndoRedo();
  }, [clearUndoRedo, path, saveAs]);

  const saveAll = useCallback(async () => {
    await fetch("http://localhost:8000/project/save-all", {
      method: "POST",
    });

    // Clear the update stack as the line and column numbers of jsx elements
    // Will most likely change after formatting resulting in the rpc calls not
    // Working anymore.
    clearUndoRedo();
  }, [clearUndoRedo]);

  const open = useEvent((path: string, exportName: string) => {
    fetch(
      `http://localhost:8000/scene/${encodeURIComponent(
        path
      )}/${exportName}/open`
    );
  });

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
      { skipTransition: true }
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

  const duplicateSelection = useCallback(async () => {
    if (!target) {
      return;
    }

    const originalTarget = target;
    let pos: { column: number; line: number };

    const redoAction = async () => {
      const response = await fetch(
        `http://localhost:8000/scene/${encodeURIComponent(path)}/object/${
          target.line
        }/${target.column}/duplicate`,
        { method: "POST" }
      );

      pos = await response.json();

      scene.focus({
        column: pos.column,
        line: pos.line,
        parentPath: originalTarget.parentPath,
        path: originalTarget.parentPath,
      });
    };

    const undoAction = () => {
      fetch(
        `http://localhost:8000/scene/${encodeURIComponent(path)}/object/${
          pos.line
        }/${pos.column}/delete`,
        { method: "POST" }
      );
      scene.deleteComponent({
        column: pos.column,
        line: pos.line,
        parentPath: target.parentPath,
      });
      scene.focus(originalTarget);
    };

    performUndoableEvent({
      redo: redoAction,
      undo: undoAction,
    });
  }, [path, performUndoableEvent, scene, target]);

  return useMemo(
    () => ({
      /**
       * Adds the component into the current file. Is not persisted until
       * `save()` is called.
       */
      addComponent,
      /**
       * Closes the file, clearing out any intermediate state.
       */
      close,
      /**
       * Deletes the currently focused scene object. Able to be undone. Is not
       * persisted until `save()` is called.
       */
      deleteComponent,
      /**
       * Duplicates the selected element into the scene.
       */
      duplicateSelection,
      /**
       * Encoded (via `encodeURIComponent()`) props used to hydrate the loaded
       * scene.
       */
      encodedProps,
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
       * Returns the scene export name that is currently open.
       */
      exportName,
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
       * Creates a new intermediate component in the open file and transitions
       * the editor to it.
       */
      newComponent,
      /**
       * Creates a new intermediate file and transitions the editor to the file.
       */
      newFile,
      /**
       * Opens the file at the passed in path and export name.
       */
      open,
      /**
       * Current value of the scene path.
       */
      path,
      /**
       * Persists the passed in prop value to the scene frame and web server,
       * and makes it available as an undo/redo action.
       */
      persistPropValue,
      /**
       * Resets the scene throwing away any unsaved state.
       */
      reset,
      /**
       * Saves the current file to the filesystem.
       */
      save,
      /**
       * Saves all currently opened files that aren't "new" to the filesystem.
       */
      saveAll,
      /**
       * Presents a dialog to choose where to save the file to, and if chosen
       * persists to the filesystem.
       */
      saveAs,
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
      close,
      deleteComponent,
      duplicateSelection,
      encodedProps,
      enteredComponent,
      exitComponent,
      exportName,
      focus,
      newComponent,
      newFile,
      open,
      path,
      persistPropValue,
      reset,
      save,
      saveAll,
      saveAs,
      set,
      target,
    ]
  );
}
