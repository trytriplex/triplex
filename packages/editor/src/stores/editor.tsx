import { useCallback, useDeferredValue } from "react";
import { useSearchParams } from "react-router-dom";
import { create } from "zustand";

export interface Params {
  encodedProps?: string;
  path?: string;
}

export interface FocusedObject {
  path: string;
  line: number;
  column: number;
  name: string;
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
  const deferredPath = useDeferredValue(path);
  const encodedProps = searchParams.get("props") || "";
  const focus = useSelectionStore((store) => store.focus);
  const target = useSelectionStore((store) => store.focused);

  const set = useCallback(
    (params: Params) => {
      if (params.path === path) {
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

      setSearchParams(newParams);
    },
    [path, setSearchParams]
  );

  return {
    path: deferredPath,
    encodedProps,
    set,
    focus,
    target,
  };
}
