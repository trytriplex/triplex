/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { createContext, useContext } from "react";

export const SceneObjectEventsContext = createContext<
  (filter?: { column: number; line: number; path: string }) => void
>(() => {});

/**
 * Notifies the parent selection component that this component has mounted. We
 * do this because a component can be mounted (because of HMR) after a selection
 * command has been triggered, resulting in the selection not being set because
 * no element could be found.
 *
 * To work around this we callback on mount, just in case, to after-the-fact set
 * the selected element.
 */
export function useSceneObjectEvents() {
  return { onSceneObjectCommitted: useContext(SceneObjectEventsContext) };
}
