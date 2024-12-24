/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */

import { useEvent } from "@triplex/lib";
import { useEffect, useMemo, useReducer, useState } from "react";
import { useSelectionStore, type SelectionListener } from "./store";
import { type SelectionState } from "./types";

type Resolver<T> = (selections: SelectionState[]) => T[];
type SelectionEvent<T> = (resolved: T) => void;

function incrementReducer(state: number) {
  return state + 1;
}

export function useSelectionMarshal<
  T extends { meta: { column: number; line: number; path: string } },
>({
  listener,
  onDeselect,
  onSelect,
  resolve,
}: {
  listener: SelectionListener;
  onDeselect: SelectionEvent<T>;
  onSelect: SelectionEvent<T>;
  resolve: Resolver<T>;
}) {
  const selections = useSelectionStore((store) => store.selections);
  const select = useSelectionStore((store) => store.select);
  const clear = useSelectionStore((store) => store.clear);
  const listen = useSelectionStore((store) => store.listen);
  const [resolved, setResolvedAsSideEffect] = useState<T[]>([]);
  const [resolveCount, forciblyResolve] = useReducer(incrementReducer, 0);
  const listenerEvent: SelectionListener = useEvent(listener);
  const resolverEvent: Resolver<T> = useEvent(resolve);
  const onSelectEvent: SelectionEvent<T> = useEvent(onSelect);
  const onDeselectEvent: SelectionEvent<T> = useEvent(onDeselect);

  useEffect(() => {
    if (selections.length === 0) {
      setResolvedAsSideEffect([]);
      return;
    }

    const resolved = resolverEvent(selections);

    setResolvedAsSideEffect(resolved);

    resolved.forEach((selection) => onSelectEvent(selection));

    return () => {
      resolved.forEach((selection) => onDeselectEvent(selection));
    };
  }, [selections, resolveCount, resolverEvent, onSelectEvent, onDeselectEvent]);

  useEffect(() => {
    return listen(listenerEvent);
  }, [listen, listenerEvent]);

  const resolveIfMissing = useEvent(
    (path: string, line: number, column: number) => {
      const isSelected = selections.some(
        (selection) =>
          selection.path === path &&
          selection.line === line &&
          selection.column === column,
      );
      const isObjectMissing = resolved.every(
        (object) =>
          object.meta.path !== path &&
          object.meta.line !== line &&
          object.meta.column !== column,
      );

      if (isSelected && isObjectMissing) {
        forciblyResolve();
      }
    },
  );

  const store = useMemo(
    () => ({
      clear,
      forciblyResolve,
      resolveIfMissing,
      select,
    }),
    [select, clear, resolveIfMissing, forciblyResolve],
  );

  return [resolved, store] as const;
}
