import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { create } from "zustand";

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

const useSelectionStore = create<SelectionState>((set) => ({
  focused: null,
  focus: (sceneObject) => set({ focused: sceneObject }),
}));

export function useEditor() {
  const [searchParams, setSearchParams] = useSearchParams({ path: "" });
  const path = searchParams.get("path") || "";
  const encodedProps = searchParams.get("props") || "";
  const exportName = searchParams.get("exportName") || "";
  const focus = useSelectionStore((store) => store.focus);
  const target = useSelectionStore((store) => store.focused);

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

  return {
    path,
    encodedProps,
    set,
    focus,
    target,
    exportName,
  };
}
