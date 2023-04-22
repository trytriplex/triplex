import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { create } from "zustand";
import { ComponentType } from "../api-types";
import { useScene } from "./scene";

export interface Params {
  encodedProps: string;
  path: string;
  exportName: string;
}

export interface FocusedObject {
  line: number;
  column: number;
  ownerPath: string;
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

interface UndoRedo {
  undo: () => void;
  redo: () => void;
}

const undoStack: UndoRedo[] = [];
const redoStack: UndoRedo[] = [];

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

  const getState = useCallback(() => {
    return {
      undoAvailable: undoStack.length > 0,
      redoAvailable: redoStack.length > 0,
    };
  }, []);

  const addComponent = useCallback(
    async (component: ComponentType) => {
      const res = await fetch(
        "http://localhost:8000/scene/" +
          encodeURIComponent(path) +
          `/${exportName}/object`,
        {
          method: "POST",
          body: JSON.stringify({
            target: component,
          }),
        }
      );

      const result = (await res.json()) as { line: number; column: number };

      scene.focus({
        column: result.column,
        line: result.line,
        ownerPath: path,
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
        path: target.ownerPath,
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
        path: target.ownerPath,
      });
    };

    // Initiate the deletion
    redoAction();
    scene.blur();

    undoStack.push({
      undo: undoAction,
      redo: redoAction,
    });
  }, [path, scene, target]);

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
            JSON.stringify(data.currentPropValue)
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
            JSON.stringify(data.nextPropValue)
          )}&path=${encodeURIComponent(data.path)}&name=${encodeURIComponent(
            data.propName
          )}`
        );
      };

      undoStack.push({
        undo: undoAction,
        redo: redoAction,
      });
      redoStack.length = 0;

      redoAction();
    },
    [scene]
  );

  const undo = useCallback(() => {
    const action = undoStack.pop();
    if (action) {
      action.undo();
      redoStack.push(action);
    }
  }, []);

  const redo = useCallback(() => {
    const action = redoStack.pop();
    if (action) {
      action.redo();
      undoStack.push(action);
    }
  }, []);

  const reset = useCallback(() => {
    undoStack.length = 0;
    redoStack.length = 0;
    fetch(`http://localhost:8000/scene/${encodeURIComponent(path)}/reset`);
  }, [path]);

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
        forceRenameOnSave?: true;
      } = {}
    ) => {
      if (
        componentParams.path === path &&
        componentParams.exportName === exportName &&
        typeof metaParams.forceSaveAs === "undefined" &&
        typeof metaParams.forceRenameOnSave === "undefined"
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

      if (metaParams.forceRenameOnSave) {
        newParams.forceRenameOnSave = "true";
      }

      setSearchParams(newParams, { replace: metaParams.replace });
    },
    [exportName, path, setSearchParams]
  );

  const save = useCallback(
    async (saveAs = !!searchParams.get("forceSaveAs")) => {
      let actualPath = path;
      let actualExportName = exportName;

      if (saveAs) {
        const enteredPath = prompt("Filename", path) || "";
        if (!enteredPath) {
          // Abort, user cleared filename or cancelled.
          return;
        } else {
          actualPath = enteredPath;
        }
      }

      if (searchParams.get("forceRenameOnSave")) {
        const enteredName = prompt("Component Name", exportName);
        if (!enteredName) {
          // Abort, user cleared the name or cancelled.
          return;
        }

        if (exportName !== enteredName) {
          actualExportName = enteredName;

          // The user decided to change the name on save
          await fetch(
            `http://localhost:8000/scene/${encodeURIComponent(
              path
            )}/${exportName}`,
            { method: "POST", body: JSON.stringify({ name: enteredName }) }
          );

          set(
            {
              encodedProps: "",
              exportName: enteredName,
              path,
            },
            { replace: true }
          );
        }
      }

      // Clear the update stack as the line and column numbers of jsx elements
      // Will most likely change after formatting resulting in the rpc calls not
      // Working anymore.
      undoStack.length = 0;
      redoStack.length = 0;

      await fetch(
        `http://localhost:8000/scene/${encodeURIComponent(
          path
        )}/save?newPath=${actualPath}`
      );

      set(
        {
          encodedProps: "",
          exportName: actualExportName,
          path: actualPath,
        },
        { replace: true }
      );
    },
    [exportName, path, searchParams, set]
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
      { forceSaveAs: true, forceRenameOnSave: true }
    );
  }, [set]);

  const newComponent = useCallback(async () => {
    const result = await fetch(
      `http://localhost:8000/scene/${encodeURIComponent(path)}/new`,
      { method: "POST" }
    );
    const data = await result.json();

    set(
      {
        exportName: data.exportName,
        path: data.path,
        encodedProps: "",
      },
      {
        forceRenameOnSave: true,
      }
    );
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
       * Calls the undo action at the top of the undo stack and then moves it to
       * the redo stack.
       */
      undo,
      /**
       * Calls the redo action at the top of the redo stack and then moves it to
       * the undo stack.
       */
      redo,
      /**
       * Returns the current state of editor internals when called.
       */
      getState,
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
      getState,
      newComponent,
      newFile,
      path,
      persistPropValue,
      redo,
      reset,
      save,
      set,
      target,
      undo,
    ]
  );
}
