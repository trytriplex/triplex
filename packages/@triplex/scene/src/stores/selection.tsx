/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { createContext, useContext } from "react";

export const SceneObjectEventsContext = createContext<
  (path: string, line: number, column: number) => void
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
export function useOnSceneObjectMount() {
  return useContext(SceneObjectEventsContext);
}
