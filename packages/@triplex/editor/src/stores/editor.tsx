/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { useEvent } from "@triplex/lib";
import type { ComponentTarget, ComponentType } from "@triplex/server";
import { startTransition, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { create } from "zustand";
import { stringifyJSON } from "../util/string";
import { useScene } from "./scene";

export interface Params {
  encodedProps: string;
  exportName: string;
  index?: number;
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
  line: number;
  path: string;
  propName: string;
  propValue: unknown;
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
  const index = searchParams.get("index")
    ? Number(searchParams.get("index"))
    : undefined;
  const encodedProps = searchParams.get("props") || "";
  const exportName = searchParams.get("exportName") || "";
  const enteredComponent = !!searchParams.get("entered") || false;
  const focus = useSelectionStore((store) => store.focus);
  const target = useSelectionStore((store) => store.focused);
  const scene = useScene();

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
        `http://localhost:${window.triplex.env.ports.server}/scene/` +
          encodeURIComponent(componentPath) +
          `/${componentExportName}/object`,
        {
          body: JSON.stringify({
            target,
            type,
          }),
          method: "POST",
        },
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
    [path, exportName, scene],
  );

  const deleteComponent = useCallback(
    (element?: { column: number; line: number; parentPath: string }) => {
      const toDelete = element || target;
      if (!toDelete) {
        return;
      }

      fetch(
        `http://localhost:${
          window.triplex.env.ports.server
        }/scene/${encodeURIComponent(toDelete.parentPath)}/object/${
          toDelete.line
        }/${toDelete.column}/delete`,
        { method: "POST" },
      );
      scene.deleteComponent({
        column: toDelete.column,
        line: toDelete.line,
        parentPath: toDelete.parentPath,
      });

      scene.blur();
    },
    [scene, target],
  );

  const exitComponent = useCallback(() => {
    window.history.back();
  }, []);

  const close = useEvent((filePath: string) => {
    fetch(
      `http://localhost:${
        window.triplex.env.ports.server
      }/scene/${encodeURIComponent(filePath)}/close`,
    );
  });

  const move = useEvent(
    (
      path: string,
      source: { column: number; line: number },
      destination: { column: number; line: number },
      action: "move-before" | "move-after" | "make-child" | "reparent",
    ) => {
      fetch(
        `http://localhost:${
          window.triplex.env.ports.server
        }/scene/${encodeURIComponent(path)}/object/${source.line}/${
          source.column
        }/move?destLine=${destination.line}&destCol=${
          destination.column
        }&action=${action}`,
        { method: "POST" },
      );
    },
  );

  const persistPropValue = useCallback(
    (data: PersistPropValue) => {
      const propData = {
        column: data.column,
        line: data.line,
        path: data.path,
        propName: data.propName,
        propValue: data.propValue,
      };

      scene.setPropValue(propData);

      fetch(
        `http://localhost:${window.triplex.env.ports.server}/scene/object/${
          data.line
        }/${data.column}/prop?value=${encodeURIComponent(
          stringifyJSON(data.propValue),
        )}&path=${encodeURIComponent(data.path)}&name=${encodeURIComponent(
          data.propName,
        )}`,
      );
    },
    [scene],
  );

  const reset = useCallback(() => {
    scene.blur();
    scene.reset();

    fetch(
      `http://localhost:${
        window.triplex.env.ports.server
      }/scene/${encodeURIComponent(path)}/reset`,
    );
  }, [path, scene]);

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
      } = {},
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

      if (componentParams.index !== undefined) {
        newParams.index = String(componentParams.index);
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
    [exportName, path, setSearchParams],
  );

  const saveAs = useCallback(async () => {
    const newPath = await window.triplex.showSaveDialog(path);
    if (!newPath) {
      return;
    }

    await fetch(
      `http://localhost:${
        window.triplex.env.ports.server
      }/scene/${encodeURIComponent(path)}/save-as?newPath=${encodeURIComponent(
        newPath,
      )}`,
      {
        method: "POST",
      },
    );

    if (newPath !== path) {
      // Path has changed, redirect!
      set(
        {
          encodedProps,
          exportName,
          path: newPath,
        },
        { skipTransition: true },
      );
    }
  }, [encodedProps, exportName, path, set]);

  const save = useCallback(async () => {
    const response = await fetch(
      `http://localhost:${
        window.triplex.env.ports.server
      }/scene/${encodeURIComponent(path)}/save`,
      {
        method: "POST",
      },
    );
    const data = await response.json();

    if (data.message === "error" && data.error.id === "missing-new-path") {
      return saveAs();
    }
  }, [path, saveAs]);

  const saveAll = useCallback(async () => {
    await fetch(
      `http://localhost:${window.triplex.env.ports.server}/project/save-all`,
      {
        method: "POST",
      },
    );
  }, []);

  const open = useEvent(
    (path: string, exportName: string, index: number = -1) => {
      fetch(
        `http://localhost:${
          window.triplex.env.ports.server
        }/scene/${encodeURIComponent(path)}/${exportName}/open?index=${index}`,
      );
    },
  );

  const newFile = useCallback(async () => {
    const result = await fetch(
      `http://localhost:${window.triplex.env.ports.server}/scene/new`,
      {
        method: "POST",
      },
    );
    const data = await result.json();

    set(
      {
        encodedProps: "",
        exportName: data.exportName,
        path: data.path,
      },
      { skipTransition: true },
    );
  }, [set]);

  const newComponent = useCallback(async () => {
    const result = await fetch(
      `http://localhost:${
        window.triplex.env.ports.server
      }/scene/${encodeURIComponent(path)}/new`,
      { method: "POST" },
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

    const response = await fetch(
      `http://localhost:${
        window.triplex.env.ports.server
      }/scene/${encodeURIComponent(path)}/object/${target.line}/${
        target.column
      }/duplicate`,
      { method: "POST" },
    );

    pos = await response.json();

    scene.focus({
      column: pos.column,
      line: pos.line,
      parentPath: originalTarget.parentPath,
      path: originalTarget.parentPath,
    });
  }, [path, scene, target]);

  const undo = useEvent(() => {
    fetch(
      `http://localhost:${
        window.triplex.env.ports.server
      }/scene/${encodeURIComponent(path)}/undo`,
      {
        method: "POST",
      },
    );
  });

  const redo = useEvent(() => {
    fetch(
      `http://localhost:${
        window.triplex.env.ports.server
      }/scene/${encodeURIComponent(path)}/redo`,
      {
        method: "POST",
      },
    );
  });

  return useMemo(
    () => ({
      /**
       * Adds the component into the current file. Is not persisted until
       * `save()` is called.
       */
      addComponent,
      /** Closes the file, clearing out any intermediate state. */
      close,
      /**
       * Deletes the currently focused scene object. Able to be undone. Is not
       * persisted until `save()` is called.
       */
      deleteComponent,
      /** Duplicates the selected element into the scene. */
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
      /** Exits the currently entered component and goes back to the parent. */
      exitComponent,
      /** Returns the scene export name that is currently open. */
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
      /** If the file is opened at a particular index this will be set. */
      index,
      /** Moves the element to a new location. */
      move,
      /**
       * Creates a new intermediate component in the open file and transitions
       * the editor to it.
       */
      newComponent,
      /** Creates a new intermediate file and transitions the editor to the file. */
      newFile,
      /** Opens the file at the passed in path and export name. */
      open,
      /** Current value of the scene path. */
      path,
      /**
       * Persists the passed in prop value to the scene frame and web server,
       * and makes it available as an undo/redo action.
       */
      persistPropValue,
      /** Re-applies the last action. */
      redo,
      /** Resets the scene throwing away any unsaved state. */
      reset,
      /** Saves the current file to the filesystem. */
      save,
      /** Saves all currently opened files that aren't "new" to the filesystem. */
      saveAll,
      /**
       * Presents a dialog to choose where to save the file to, and if chosen
       * persists to the filesystem.
       */
      saveAs,
      /** Sets the loaded scene to a specific path, export name, and props. */
      set,
      /** Returns the currently focused scene object, else `null`. */
      target,
      /** Unapplies the last action. */
      undo,
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
      index,
      move,
      newComponent,
      newFile,
      open,
      path,
      persistPropValue,
      redo,
      reset,
      save,
      saveAll,
      saveAs,
      set,
      target,
      undo,
    ],
  );
}
