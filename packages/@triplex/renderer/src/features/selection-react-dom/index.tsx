/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */

import { SceneObjectContext } from "../scene-element/context";

export function ReactDOMSelection({ children }: { children: React.ReactNode }) {
  return (
    <SceneObjectContext.Provider value={true}>
      {children}
    </SceneObjectContext.Provider>
  );
}
