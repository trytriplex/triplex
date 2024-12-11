/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */

import { useFrame, useThree } from "@react-three/fiber";
import { useEvent } from "@triplex/lib";
import { useEffect, useMemo, useReducer, useState } from "react";
import { SELECTION_LAYER_INDEX } from "../../util/layers";
import { resolveObject3D, type EditorNodeData } from "../../util/scene";
import { type TransformControlMode } from "./types";

interface SelectionState {
  column: number;
  line: number;
  parentPath: string;
  path: string;
}

function incrementReducer(state: number) {
  return state + 1;
}

export function useSelectedObject({
  transform,
}: {
  transform: TransformControlMode;
}) {
  const [selections, setSelections] = useState<SelectionState[]>([]);
  const [resolvedObjects, setResolvedObjectsAsSideEffect] = useState<
    EditorNodeData[]
  >([]);
  const [resolveCount, forciblyResolveObjects] = useReducer(
    incrementReducer,
    0,
  );
  const scene = useThree((state) => state.scene);

  useFrame(() => {
    for (const object of resolvedObjects) {
      if (object.sceneObject.parent === null) {
        forciblyResolveObjects();
        break;
      }
    }
  });

  useEffect(() => {
    if (selections.length === 0) {
      setResolvedObjectsAsSideEffect([]);
      return;
    }

    const nextResolvedObjects = selections
      .map((selection) => {
        return resolveObject3D(scene, {
          column: selection.column,
          line: selection.line,
          path: selection.parentPath,
          transform,
        });
      })
      .filter((selection) => !!selection);

    nextResolvedObjects.forEach((object) => {
      object.sceneObject.traverse((child) =>
        child.layers.enable(SELECTION_LAYER_INDEX),
      );
    });

    setResolvedObjectsAsSideEffect(nextResolvedObjects);

    return () => {
      nextResolvedObjects.forEach((object) => {
        object.sceneObject.traverse((child) =>
          child.layers.disable(SELECTION_LAYER_INDEX),
        );
      });
    };
  }, [
    scene,
    selections,
    transform,
    // This will forcibly re-resolve the objects from the renderer scene when the value is changed.
    resolveCount,
  ]);

  const select = useEvent(
    (
      element: SelectionState | SelectionState[],
      action: "replace" | "addition",
    ) => {
      switch (action) {
        case "replace": {
          const nextSelections = Array.isArray(element) ? element : [element];
          setSelections(nextSelections);
          return;
        }

        case "addition": {
          setSelections((prevSelections) => {
            const nextSelections = prevSelections.concat(element);
            return nextSelections;
          });

          return;
        }
      }
    },
  );

  const clear = useEvent(() => {
    setSelections((prevSelections) => {
      if (prevSelections.length === 0) {
        return prevSelections;
      }

      return [];
    });
  });

  const resolveObjectsIfMissing = useEvent(
    (path: string, line: number, column: number) => {
      const isSelected = selections.some(
        (selection) =>
          selection.path === path &&
          selection.line === line &&
          selection.column === column,
      );
      const isObjectMissing = resolvedObjects.every(
        (object) =>
          object.path !== path &&
          object.line !== line &&
          object.column !== column,
      );

      if (isSelected && isObjectMissing) {
        forciblyResolveObjects();
      }
    },
  );

  const store = useMemo(
    () => ({
      clear,
      resolveObjectsIfMissing,
      select,
    }),
    [select, clear, resolveObjectsIfMissing],
  );

  return [resolvedObjects, store] as const;
}
