import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { create } from "zustand";
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

export function useEditor() {
  const [searchParams, setSearchParams] = useSearchParams({ path: "" });
  const path = searchParams.get("path") || "";
  const encodedProps = searchParams.get("props") || "";
  const exportName = searchParams.get("exportName") || "";
  const focus = useSelectionStore((store) => store.focus);
  const target = useSelectionStore((store) => store.focused);
  const scene = useScene();

  const getState = useCallback(() => {
    return {
      undoAvailable: undoStack.length > 0,
      redoAvailable: redoStack.length > 0,
    };
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

  const save = useCallback(() => {
    undoStack.length = 0;
    redoStack.length = 0;
    fetch(`http://localhost:8000/scene/${encodeURIComponent(path)}/save`);
  }, [path]);

  const reset = useCallback(() => {
    undoStack.length = 0;
    redoStack.length = 0;
    fetch(`http://localhost:8000/scene/${encodeURIComponent(path)}/reset`);
  }, [path]);

  if (path && !exportName) {
    throw new Error("invariant: exportName is undefined");
  }

  const set = useCallback(
    (params: Params) => {
      if (params.path === path && params.exportName === exportName) {
        // Bail if we're already on the same path.
        // If we implement props being able to change
        // We'll need to do more work here later.
        return;
      }

      const newParams: Record<string, string> = {};

      if (params.path) {
        newParams.path = params.path;
      }

      if (params.encodedProps) {
        newParams.props = params.encodedProps;
      }

      if (params.exportName) {
        newParams.exportName = params.exportName;
      }

      setSearchParams(newParams);
    },
    [exportName, path, setSearchParams]
  );

  return useMemo(
    () => ({
      /**
       * Current value of the scene path.
       */
      path,
      /**
       * Encoded (via `encodeURIComponent()`) props used to hydrate the loaded scene.
       */
      encodedProps,
      /**
       * Sets the loaded scene to a specific path, export name, and props.
       */
      set,
      /**
       * Focuses the passed scene object.
       * Will blur the currently focused scene object by passing `null`.
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
       * Calls the web server to save the intermediate scene source to file system.
       */
      save,
      /**
       * Persists the passed in prop value to the scene frame and web server,
       * and makes it available as an undo/redo action.
       */
      persistPropValue,
      /**
       * Calls the undo action at the top of the undo stack and then moves it to the redo stack.
       */
      undo,
      /**
       * Calls the redo action at the top of the redo stack and then moves it to the undo stack.
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
      encodedProps,
      exportName,
      focus,
      getState,
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
